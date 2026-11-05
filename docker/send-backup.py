#!/usr/bin/env python3
import argparse
import hashlib
import json
import pathlib
import re
import smtplib
import ssl
import subprocess
import sys
from email.message import EmailMessage
from email.utils import formatdate, make_msgid


def main():
    parser = argparse.ArgumentParser(description='Send an encrypted Saldoa backup using production SMTP.')
    parser.add_argument('--compose-file', required=True)
    parser.add_argument('--environment-file', required=True)
    parser.add_argument('--recipient', required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--archive', type=pathlib.Path)
    mode.add_argument('--failure', action='store_true')
    arguments = parser.parse_args()
    if not re.fullmatch(r'[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+', arguments.recipient):
        raise ValueError('Invalid backup recipient')

    payload = None
    if arguments.archive is not None:
        if arguments.archive.suffix != '.cms' or not arguments.archive.is_file():
            raise ValueError('An encrypted CMS archive is required')
        if arguments.archive.stat().st_size > 15 * 1024 * 1024:
            raise ValueError('Backup exceeds the 15 MiB attachment limit; configure another destination')
        payload = arguments.archive.read_bytes()
        if len(payload) < 16 or payload[0] != 0x30:
            raise ValueError('Invalid encrypted CMS archive')
        length_octets = payload[1] & 0x7f if payload[1] & 0x80 else 0
        if length_octets > 4 or payload[1] == 0x80:
            raise ValueError('Invalid encrypted CMS archive')
        content_offset = 2 + length_octets
        authenticated_envelope_oid = bytes.fromhex('060b2a864886f70d0109100117')
        if payload[content_offset:content_offset + len(authenticated_envelope_oid)] != authenticated_envelope_oid:
            raise ValueError('Only authenticated encrypted CMS envelopes may be emailed')
        subprocess.run(
            ['openssl', 'cms', '-cmsout', '-noout', '-inform', 'DER', '-in', str(arguments.archive)],
            check=True, capture_output=True, timeout=30,
        )

    result = subprocess.run(
        ['docker', 'compose', '--project-name', 'saldoa-production', '--env-file', arguments.environment_file,
         '-f', arguments.compose_file, 'config', '--format', 'json'],
        check=True, capture_output=True, text=True, timeout=30,
    )
    environment = json.loads(result.stdout)['services']['app']['environment']
    if environment.get('MAIL_SCHEME') != 'smtps' or int(environment['MAIL_PORT']) != 465:
        raise ValueError('Backup mail requires SMTP over verified TLS on port 465')
    message = EmailMessage()
    message['From'] = environment['MAIL_FROM_ADDRESS']
    message['To'] = arguments.recipient
    message['Date'] = formatdate(localtime=False)
    message['Message-ID'] = make_msgid()
    if arguments.failure:
        message['Subject'] = 'Saldoa: FALHA no backup'
        message.set_content(
            'O backup do Saldoa falhou. Confira no servidor: '
            'sudo journalctl -u saldoa-backup.service --since today --no-pager\n'
            'A ausencia do backup esperado a cada 15 dias tambem exige verificacao.\n'
        )
    else:
        checksum = hashlib.sha256(payload).hexdigest()
        message['Subject'] = 'Saldoa: backup criptografado - ' + arguments.archive.name
        message.set_content(
            'Copia criptografada do backup do Saldoa.\n'
            'A chave privada de recuperacao permanece fora do servidor e nao esta neste e-mail.\n'
            f'Arquivo: {arguments.archive.name}\nSHA256: {checksum}\n'
            'Guarde a chave e uma segunda copia segura em outro local.\n'
            'SMTP aceito nao substitui conferir o recebimento e testar a recuperacao.\n'
        )
        message.add_attachment(payload, maintype='application', subtype='octet-stream', filename=arguments.archive.name)
        message.add_attachment(
            f'{checksum}  {arguments.archive.name}\n'.encode(),
            maintype='application', subtype='octet-stream', filename=arguments.archive.name + '.sha256',
        )
    with smtplib.SMTP_SSL(environment['MAIL_HOST'], 465, timeout=45, context=ssl.create_default_context()) as smtp:
        smtp.login(environment['MAIL_USERNAME'], environment['MAIL_PASSWORD'])
        refused = smtp.send_message(message)
        if refused:
            raise smtplib.SMTPException('Backup recipient was refused')
    print('BACKUP_MAIL_ACCEPTED' if not arguments.failure else 'BACKUP_FAILURE_NOTICE_ACCEPTED')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Backup mail failed ({type(error).__name__}); check configuration, attachment size, and SMTP access.', file=sys.stderr)
        sys.exit(1)
