# Changelog

Release notes for the Saldoa website and Android app. Dates below follow the published release date in UTC.

## [1.1.0] - 2026-11-05

### Added

- Upcoming recurring transactions in the dashboard and planning agenda, separate from recorded balances.
- Month navigation, description search, transaction filters, and pagination in the mobile transaction history.
- A version history shared by the web and mobile documentation.

### Improved

- Refreshed signed-in dashboard, transaction, and planning screens on web and mobile.
- A four-tab mobile navigation bar: Home, Transactions, Planning, and More.
- Mobile transactions grouped by date, with creation and editing in a bottom sheet.
- Monthly charts, spending-limit cards, and a smaller balance-visibility control.

### Fixed

- More now opens Categories, Recurring transactions, and Account correctly; the profile avatar also opens Account.
- Password validation explains minimum length, complexity, and confirmation errors in Portuguese and English instead of exposing translation keys.
- Upcoming transactions include the last day of the selected month and respect user ownership and recurrence end dates.
- Production images now include the application's translation files.

### Compatibility and validation

- Public home, sign-in, and registration keep their existing design.
- Existing recorded balances and financial rules are preserved; no database migration is required.
- Android 1.1.0, version code 3, was tested on a physical device by the author.
- Automated checks: 157 PHP tests passed, two skipped because two-factor authentication is disabled, and 15 mobile tests passed.
- The APK supports ARM64 and uses the existing debug signing key. It is distributed directly through GitHub Releases.
- The agenda previews the next occurrence of each recurring rule; it does not introduce paid/unpaid bill tracking.

## [1.0.0] - 2026-11-05

First stable portfolio release, bringing together the web application created in 2025 and the mobile app created in 2026.

- Income and expenses, categories, monthly dashboards, spending budgets, and recurring transactions.
- Data export and account management.
- Mobile support for Portuguese and English, with light, dark, and system themes.
- The Saldoa Flow brand across the website and Android app.
- Public HTTPS website and API hosted on AWS with Docker.
- Gmail delivery for password recovery and email-based account deletion.
- Encrypted off-server backups by email every 15 days, with recovery verified in isolated containers.
- Android ARM64 APK for direct installation, signed with a debug key.

## [mobile-v1.0.0-preview.1] - 2026-11-05

First public Android preview, using the hosted HTTPS API and supporting direct APK installation. Superseded by version 1.0.0.

[1.1.0]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.1.0
[1.0.0]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.0.0
[mobile-v1.0.0-preview.1]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/mobile-v1.0.0-preview.1
