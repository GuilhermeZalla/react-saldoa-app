#!/usr/bin/env python3
import base64
import json
import os
import pathlib
import re
import subprocess
import sys
import tarfile
import time


def command(arguments, **options):
    result = subprocess.run(arguments, capture_output=True, text=True, timeout=180, **options)
    if result.returncode:
        raise RuntimeError('Isolated recovery command failed: ' + arguments[0])
    return result.stdout


def main():
    directory = pathlib.Path(sys.argv[1]).resolve()
    network = sys.argv[2]
    if directory.parent != pathlib.Path('/dev/shm') or not directory.name.startswith('saldoa-restore.'):
        raise ValueError('Use the private recovery directory')
    if not re.fullmatch(r'saldoa-restore-[A-Za-z0-9]+', network):
        raise ValueError('Use the isolated recovery network')
    image_file = directory / 'images.json'
    images = json.loads(image_file.read_text())
    for service in ['app', 'web']:
        images[service] = os.environ.get('SALDOA_RESTORE_' + service.upper() + '_IMAGE', images[service])
    if set(images) != {'app', 'web', 'database'} or not all(re.fullmatch(r'sha256:[0-9a-f]{64}', image) for image in images.values()):
        raise ValueError('Invalid recovery image metadata')
    with tarfile.open(directory / 'configuration.tar.gz', 'r:gz') as archive:
        configuration = archive.extractfile('.env.production').read().decode()
    app_key = next(line.split('=', 1)[1].strip().strip('\"\'') for line in configuration.splitlines() if line.startswith('APP_KEY='))
    if not app_key.startswith('base64:') or len(base64.b64decode(app_key[7:], validate=True)) != 32:
        raise ValueError('Invalid recovery application key')
    database_environment = dict(line.split('=', 1) for line in (directory / 'mysql.env').read_text().splitlines())
    environment = {
        'APP_NAME': 'Saldoa', 'APP_ENV': 'production', 'APP_DEBUG': 'false', 'APP_KEY': app_key,
        'APP_URL': 'http://recovered-web', 'APP_LOCALE': 'pt_BR', 'APP_FALLBACK_LOCALE': 'pt_BR',
        'LOG_CHANNEL': 'stderr', 'LOG_LEVEL': 'warning', 'DB_CONNECTION': 'mysql', 'DB_HOST': 'database',
        'DB_PORT': '3306', 'DB_DATABASE': 'saldoa', 'DB_USERNAME': 'root',
        'DB_PASSWORD': database_environment['MYSQL_ROOT_PASSWORD'], 'SESSION_DRIVER': 'database',
        'SESSION_SECURE_COOKIE': 'false', 'CACHE_STORE': 'database', 'QUEUE_CONNECTION': 'database',
        'FILESYSTEM_DISK': 'local', 'MAIL_MAILER': 'array', 'DEMO_INSTANCE': 'false', 'DEMO_LOGIN_ENABLED': 'false',
    }
    env_file = directory / 'app.env'
    env_file.write_text(''.join(name + '=' + value + '\n' for name, value in environment.items()))
    env_file.chmod(0o600)
    storage = directory / 'storage'
    storage.mkdir(mode=0o755)
    with tarfile.open(directory / 'storage.tar.gz', 'r:gz') as archive:
        archive.extractall(storage, filter='data')
    for path in [storage, *storage.rglob('*')]:
        if path.is_symlink():
            continue
        os.chown(path, 33, 33)
    caddy_file = directory / 'Caddyfile'
    caddy_file.write_text(':80 {\n root * /var/www/html/public\n php_fastcgi recovered-app:9000\n file_server\n}\n')
    suffix = directory.name.split('.')[-1]
    app_name = 'saldoa-recovered-app-' + suffix
    web_name = 'saldoa-recovered-web-' + suffix
    created = []
    try:
        for name, image in [(app_name, images['app']), (web_name, images['web'])]:
            arguments = ['docker', 'run', '--detach', '--name', name, '--label', 'com.saldoa.restore-check=true',
                         '--network', network, '--network-alias', 'recovered-app' if name == app_name else 'recovered-web',
                         '--memory', '256m', '--memory-swap', '512m']
            if name == app_name:
                arguments += ['--env-file', str(env_file), '--mount', f'type=bind,source={storage},target=/var/www/html/storage']
            else:
                arguments += ['--mount', f'type=bind,source={caddy_file},target=/etc/caddy/Caddyfile,readonly']
            command([*arguments, image])
            created.append(name)
        ready = False
        for attempt in range(30):
            result = subprocess.run(['docker', 'exec', web_name, 'wget', '-q', '-O', '/dev/null', 'http://localhost/up'], capture_output=True, timeout=15)
            if result.returncode == 0:
                ready = True
                break
            time.sleep(2)
        if not ready:
            raise RuntimeError('Recovered web application did not become healthy')
        php = r'''<?php
function requestCheck(string $method, string $path, int $expected, ?array $data = null, ?string $token = null): mixed {
    $headers = ["Accept: application/json", "Content-Type: application/json"];
    if ($token !== null) { $headers[] = "Authorization: Bearer ".$token; }
    $context = stream_context_create(["http" => ["method" => $method, "header" => implode("\r\n", $headers), "content" => $data === null ? "" : json_encode($data), "ignore_errors" => true, "timeout" => 90]]);
    $body = file_get_contents("http://recovered-web".$path, false, $context);
    $status = (int) explode(" ", $http_response_header[0])[1];
    if ($status !== $expected) { throw new RuntimeException("Recovery HTTP check failed: ".$method." ".$path." status ".$status); }
    return json_decode($body, true) ?? $body;
}
requestCheck("GET", "/up", 200);
requestCheck("GET", "/login", 200);
requestCheck("GET", "/api/v1/auth/me", 401);
$email = "recovery-".bin2hex(random_bytes(8))."@example.invalid";
$password = "Restore1!".bin2hex(random_bytes(16));
$registered = requestCheck("POST", "/api/v1/auth/register", 201, ["name" => "Isolated recovery check", "email" => $email, "password" => $password, "password_confirmation" => $password, "device_name" => "Recovery check"]);
$token = $registered["access_token"];
requestCheck("GET", "/api/v1/auth/me", 200, null, $token);
$category = requestCheck("POST", "/api/v1/categories", 201, ["name" => "Recovery test", "type" => "expense"], $token);
requestCheck("POST", "/api/v1/transactions", 201, ["description" => "Recovery test", "amount" => "12.50", "type" => "expense", "category_id" => $category["data"]["id"], "date" => date("Y-m-d")], $token);
requestCheck("GET", "/api/v1/dashboard", 200, null, $token);
requestCheck("GET", "/api/v1/transactions/export", 200, null, $token);
requestCheck("DELETE", "/api/v1/account", 200, ["password" => $password], $token);
requestCheck("GET", "/api/v1/auth/me", 401, null, $token);
echo "RECOVERED_APPLICATION_HTTP_AND_API_PASSED\n";
'''
        result = subprocess.run(['docker', 'exec', '-i', '--user', 'www-data', app_name, 'php'], input=php, capture_output=True, text=True, timeout=180)
        if result.returncode:
            raise RuntimeError('Recovered application HTTP/API scenario failed; production was not modified')
        if 'RECOVERED_APPLICATION_HTTP_AND_API_PASSED' not in result.stdout:
            raise RuntimeError('Recovered application did not complete its HTTP checks')
        print('RECOVERED_APPLICATION_HTTP_AND_API_PASSED')
        print('Recovery used the restored APP_KEY, storage, SQL, and recorded application images, without published ports or internet access.')
    finally:
        for name in reversed(created):
            subprocess.run(['docker', 'rm', '-fv', name], capture_output=True, timeout=30)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Application recovery verification failed (' + type(error).__name__ + '). No production volumes were used.', file=sys.stderr)
        sys.exit(1)
