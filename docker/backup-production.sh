#!/usr/bin/env bash
set -euo pipefail
umask 077

repository_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd -- "$repository_root"
backup_root="${SALDOA_BACKUP_DIR:-/var/backups/saldoa}"
mkdir -p -- "$backup_root"

exec 9>"$backup_root/.lock"
flock -n 9 || exit 0

backup_directory="$(mktemp -d "$backup_root/$(date -u +%Y%m%dT%H%M%SZ).XXXXXX")"
touch "$backup_directory/INCOMPLETE"
compose=(docker compose --env-file .env.production -f docker-compose.production.yml)

"${compose[@]}" exec -T database sh -c \
    'MYSQL_PWD="$(cat /run/secrets/mysql_root_password)" exec mysqldump -uroot --single-transaction --routines --events --triggers --no-tablespaces "$MYSQL_DATABASE"' \
    | gzip > "$backup_directory/database.sql.gz"
"${compose[@]}" exec -T --user www-data app \
    tar -C /var/www/html/storage -czf - . > "$backup_directory/storage.tar.gz"
tar -czf "$backup_directory/configuration.tar.gz" .env.production .secrets/mysql-root-password

gzip -t "$backup_directory/database.sql.gz"
tar -tzf "$backup_directory/storage.tar.gz" > /dev/null
tar -tzf "$backup_directory/configuration.tar.gz" > /dev/null
rm -- "$backup_directory/INCOMPLETE"
printf 'Backup completed: %s\n' "$backup_directory"
