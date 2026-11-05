#!/usr/bin/env python3
import argparse
import datetime
import pathlib
import sys


def is_backup_due(last_success: pathlib.Path, now: datetime.datetime) -> bool:
    if not last_success.exists():
        return True
    timestamp = last_success.read_text().split()[0]
    completed_at = datetime.datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%SZ').replace(
        tzinfo=datetime.timezone.utc,
    )
    if completed_at > now:
        raise ValueError('Last backup timestamp is in the future')
    return (now.date() - completed_at.date()).days >= 15


def main() -> int:
    parser = argparse.ArgumentParser(description='Check whether the 15-day Saldoa backup is due.')
    parser.add_argument('--last-success', type=pathlib.Path, default=pathlib.Path('/var/backups/saldoa/last-success'))
    arguments = parser.parse_args()
    try:
        due = is_backup_due(arguments.last_success, datetime.datetime.now(datetime.timezone.utc))
    except (OSError, ValueError, IndexError) as error:
        print(f'Cannot check backup schedule ({type(error).__name__}); inspect last-success.', file=sys.stderr)
        return 255
    print('Backup is due.' if due else 'Backup skipped: fewer than 15 calendar days since last success.')
    return 0 if due else 1


if __name__ == '__main__':
    sys.exit(main())
