#!/usr/bin/env bash
set -euo pipefail
umask 077

if [[ -r /etc/saldoa/backup.env ]]; then
    source /etc/saldoa/backup.env
fi
repository_root="${SALDOA_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)}"
compose_file="${SALDOA_COMPOSE_FILE:-$repository_root/docker-compose.production.yml}"
backup_root="${SALDOA_BACKUP_DIR:-/var/backups/saldoa}"
certificate="${SALDOA_BACKUP_CERT:-/etc/saldoa/backup-public-cert.pem}"
delivery="${SALDOA_BACKUP_DELIVERY:-none}"
recipient="${SALDOA_BACKUP_EMAIL:-}"
mail_script="${SALDOA_BACKUP_MAIL_SCRIPT:-$(dirname -- "${BASH_SOURCE[0]}")/send-backup.py}"
plain_directory=''
encrypted_file=''
mail_arguments=(--compose-file "$compose_file" --environment-file "$repository_root/.env.production" --recipient "$recipient")
cleanup() {
    status=$?
    if [[ -n "$plain_directory" && "$plain_directory" == "$backup_root"/.plain.* ]]; then
        rm -rf -- "$plain_directory"
    fi
    if [[ -n "$encrypted_file" ]]; then
        rm -f -- "$encrypted_file.tmp"
    fi
    if [[ "$status" != 0 && "$delivery" == gmail && -f "$mail_script" ]]; then
        python3 "$mail_script" "${mail_arguments[@]}" --failure || true
    fi
    exit "$status"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
[[ "$delivery" == none || "$delivery" == gmail ]] || { printf 'Unsupported backup destination.\n' >&2; exit 1; }
[[ -r "$certificate" && -r "$repository_root/.env.production" && -r "$compose_file" ]] || {
    printf 'Backup certificate or production configuration is missing.\n' >&2
    exit 1
}
if [[ "$delivery" == gmail && ( -z "$recipient" || ! -r "$mail_script" ) ]]; then
    printf 'Backup mail recipient or helper is missing.\n' >&2
    exit 1
fi
mkdir -p -- "$backup_root"
chmod 700 -- "$backup_root"
exec 9>"$backup_root/.lock"
flock -w 120 9 || exit 1
plain_directory="$(mktemp -d "$backup_root/.plain.XXXXXX")"
encrypted_file="$backup_root/saldoa-$(date -u +%Y%m%dT%H%M%SZ)-${plain_directory##*.}.cms"
compose=(docker compose --project-name saldoa-production --env-file "$repository_root/.env.production" -f "$compose_file")
"${compose[@]}" exec -T database sh -c \
    'MYSQL_PWD="$(cat /run/secrets/mysql_root_password)" exec mysqldump -uroot --single-transaction --routines --events --triggers --no-tablespaces --skip-comments --skip-dump-date --order-by-primary --hex-blob --set-gtid-purged=OFF --column-statistics=0 "$MYSQL_DATABASE"' \
    < /dev/null | gzip > "$plain_directory/database.sql.gz"
"${compose[@]}" exec -T --user www-data app \
    tar -C /var/www/html/storage -czf - . < /dev/null > "$plain_directory/storage.tar.gz"
tar -C "$repository_root" -czf "$plain_directory/configuration.tar.gz" .env.production .secrets/mysql-root-password
cp -- "$compose_file" "$plain_directory/docker-compose.production.yml"
image_ids=()
for service in app web database; do
    container_id="$("${compose[@]}" ps -q "$service" < /dev/null)"
    [[ -n "$container_id" ]] || { printf 'A production service is unavailable.\n' >&2; exit 1; }
    image_ids+=("$(docker inspect --format '{{.Image}}' "$container_id")")
done
python3 - "$plain_directory/images.json" "${image_ids[@]}" <<'PY'
import json
import pathlib
import sys

pathlib.Path(sys.argv[1]).write_text(json.dumps(dict(zip(['app', 'web', 'database'], sys.argv[2:]))) + '\n')
PY
gzip -t "$plain_directory/database.sql.gz"
tar -tzf "$plain_directory/storage.tar.gz" > /dev/null
tar -tzf "$plain_directory/configuration.tar.gz" > /dev/null
(
    cd -- "$plain_directory"
    sha256sum database.sql.gz storage.tar.gz configuration.tar.gz docker-compose.production.yml images.json > manifest.sha256
)
tar -C "$plain_directory" -cf - . | openssl cms -encrypt -binary -aes-256-gcm \
    -outform DER -recip "$certificate" -keyopt rsa_padding_mode:oaep \
    -keyopt rsa_oaep_md:sha256 -out "$encrypted_file.tmp"
mv -- "$encrypted_file.tmp" "$encrypted_file"
(
    cd -- "$backup_root"
    sha256sum "${encrypted_file##*/}" > "${encrypted_file##*/}.sha256"
)
if [[ "$delivery" == gmail ]]; then
    python3 "$mail_script" "${mail_arguments[@]}" --archive "$encrypted_file" < /dev/null
    touch "$encrypted_file.emailed"
    while IFS= read -r -d '' expired_file; do
        if [[ -f "$expired_file.emailed" ]]; then
            rm -f -- "$expired_file" "$expired_file.sha256" "$expired_file.emailed"
        fi
    done < <(find "$backup_root" -maxdepth 1 -type f -name 'saldoa-*.cms' -mtime +7 -print0)
fi
printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${encrypted_file##*/}" > "$backup_root/last-success"
printf 'BACKUP_FILE=%s\n' "$encrypted_file"
