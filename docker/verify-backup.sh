#!/usr/bin/env bash
set -euo pipefail
umask 077

application=0
arguments=()
for argument in "$@"; do
    if [[ "$argument" == --application ]]; then application=1; else arguments+=("$argument"); fi
done
set -- "${arguments[@]}"

if [[ $# != 3 && ! ( $# == 1 && "$1" == --stdin ) ]]; then
    printf 'Usage: %s BACKUP.cms PRIVATE_KEY.pem PUBLIC_CERT.pem | --stdin [--application]\n' "$0" >&2
    exit 1
fi
restore_directory="$(mktemp -d /dev/shm/saldoa-restore.XXXXXX)"
container_name="saldoa-restore-check-${restore_directory##*.}"
container_created=0
network_name="saldoa-restore-${restore_directory##*.}"
network_created=0
cleanup() {
    if [[ "$container_created" == 1 ]]; then
        docker rm -fv -- "$container_name" > /dev/null 2>&1 || true
    fi
    if [[ "$network_created" == 1 ]]; then
        docker network rm -- "$network_name" > /dev/null 2>&1 || true
    fi
    if [[ "$restore_directory" == /dev/shm/saldoa-restore.* ]]; then
        rm -rf -- "$restore_directory"
    fi
}
trap cleanup EXIT
if [[ "$1" == --stdin ]]; then
    cat > "$restore_directory/backup.tar"
else
    archive="$(realpath -- "$1")"
    private_key="$(realpath -- "$2")"
    certificate="$(realpath -- "$3")"
    openssl cms -decrypt -binary -inform DER -in "$archive" -recip "$certificate" \
        -inkey "$private_key" -out "$restore_directory/backup.tar"
fi
python3 - "$restore_directory" <<'PY'
import json
import pathlib
import re
import sys
import tarfile

destination = pathlib.Path(sys.argv[1])
required = {'database.sql.gz', 'storage.tar.gz', 'configuration.tar.gz', 'docker-compose.production.yml', 'manifest.sha256'}
expected = required | {'images.json'}
seen = set()
with tarfile.open(destination / 'backup.tar', 'r:') as archive:
    for member in archive.getmembers():
        if member.name in ('.', './') and member.isdir():
            continue
        name = member.name.removeprefix('./')
        if not member.isfile() or name not in expected or name in seen:
            raise SystemExit('Unexpected backup archive member')
        seen.add(name)
        with archive.extractfile(member) as source, (destination / name).open('xb') as target:
            while block := source.read(1024 * 1024):
                target.write(block)
if not required <= seen:
    raise SystemExit('Incomplete backup archive')
manifest = (destination / 'manifest.sha256').read_text().splitlines()
if len(manifest) != len(seen) - 1 or {line.split('  ', 1)[1] for line in manifest} != seen - {'manifest.sha256'}:
    raise SystemExit('Invalid checksum manifest')
if 'images.json' in seen:
    images = json.loads((destination / 'images.json').read_text())
    if set(images) != {'app', 'web', 'database'} or not all(re.fullmatch(r'sha256:[0-9a-f]{64}', image) for image in images.values()):
        raise SystemExit('Invalid recovery image metadata')
PY
(
    cd -- "$restore_directory"
    sha256sum --check manifest.sha256 > /dev/null
)
gzip -t "$restore_directory/database.sql.gz"
tar -tzf "$restore_directory/storage.tar.gz" > /dev/null
tar -tzf "$restore_directory/configuration.tar.gz" > /dev/null
printf 'MYSQL_ROOT_PASSWORD=%s\nMYSQL_DATABASE=saldoa\n' "$(openssl rand -hex 24)" > "$restore_directory/mysql.env"
database_network=(--network none)
database_image=mysql:8.4
if [[ -f "$restore_directory/images.json" ]]; then
    database_image="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["database"])' "$restore_directory/images.json")"
fi
database_image="${SALDOA_RESTORE_DATABASE_IMAGE:-$database_image}"
if [[ "$application" == 1 ]]; then
    [[ -f "$restore_directory/images.json" ]] || { printf "Application recovery requires image metadata.\n" >&2; exit 1; }
    docker network create --internal --label com.saldoa.restore-check=true "$network_name" > /dev/null
    network_created=1
    database_network=(--network "$network_name" --network-alias database)
fi
docker run --detach --name "$container_name" --label com.saldoa.restore-check=true \
    "${database_network[@]}" --memory 512m --memory-swap 1g --env-file "$restore_directory/mysql.env" \
    "$database_image" --innodb-buffer-pool-size=64M --max-connections=10 \
    --performance-schema=OFF --event-scheduler=DISABLED > /dev/null
container_created=1
ready=0
for attempt in {1..90}; do
    if docker exec "$container_name" sh -c \
        'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql --protocol=TCP -h127.0.0.1 -uroot "$MYSQL_DATABASE" --execute="SELECT 1"' > /dev/null 2>&1; then
        ready=1
        break
    fi
    sleep 2
done
[[ "$ready" == 1 ]] || { printf 'Isolated MySQL did not become ready.\n' >&2; exit 1; }
gzip -dc "$restore_directory/database.sql.gz" | docker exec -i "$container_name" sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot "$MYSQL_DATABASE"'
docker exec "$container_name" sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --events --triggers --no-tablespaces --skip-comments --skip-dump-date --order-by-primary --hex-blob --set-gtid-purged=OFF --column-statistics=0 "$MYSQL_DATABASE"' \
    > "$restore_directory/restored.sql"
python3 - "$restore_directory" <<'PY'
import gzip
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
quoted_string = re.compile(rb"('(?:[^'\\]|\\.|'')*')")
redundant_charset = re.compile(rb' CHARACTER SET utf8mb4(?= COLLATE utf8mb4_[a-z0-9_]+(?:\s|,|$))')

def canonical_sql(content):
    lines = []
    for line in content.splitlines(keepends=True):
        if line.startswith(b'  `'):
            parts = quoted_string.split(line)
            for index in range(0, len(parts), 2):
                parts[index] = redundant_charset.sub(b'', parts[index])
            line = b''.join(parts)
        lines.append(line)
    return b''.join(lines)

original = gzip.decompress((root / 'database.sql.gz').read_bytes())
restored = (root / 'restored.sql').read_bytes()
if canonical_sql(original) != canonical_sql(restored):
    raise SystemExit('Restored SQL differs from the snapshot; no production changes were made.')
PY
printf 'Restore verified: matching SQL and schema (redundant charset declarations normalized), valid file archives, isolated container.\n'

if [[ "$application" == 1 ]]; then
    recovery_helper="${SALDOA_RECOVERY_APP_SCRIPT:-$(dirname -- "${BASH_SOURCE[0]}")/verify-restored-app.py}"
    python3 "$recovery_helper" "$restore_directory" "$network_name"
fi
