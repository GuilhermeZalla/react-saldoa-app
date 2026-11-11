# Changelog

Release notes for the Saldoa website and Android app. Dates below follow the published release date in UTC.

## [1.1.1] - 2026-11-11

### Stable Android release

- Released the approved tablet improvements as a regular GitHub release, without a test or prerelease label.
- Android version 1.1.1, version code 12, ARM64. Retains the password visibility controls, responsive sign-in/sign-up layouts, collapsible sidebar, and corrected dashboard columns from test10.
- Preserved the signing certificate so existing installations can update without uninstalling. APK and SHA256SUMS are provided with the release.
- Updated the main download links to the stable release and preserved previous versions in the release history.
- Google Play publication and monetization remain pending. The release label does not imply additional native-device tests beyond those recorded in the project status.

## [1.1.0-test10] - 2026-11-11

### Android tablet improvements

- Added accessible show/hide password controls to sign-in and sign-up in Portuguese and English, with passwords hidden initially.
- Adapted tablet sign-in and sign-up to use side-by-side presentation and form areas when width and font scaling permit.
- Added a collapsible tablet sidebar from 768 points, preserving its state during navigation and window resizing.
- Fixed dashboard cards wrapping into separate half-width rows because of fractional native layout measurements. The dashboard now uses the available width, with two columns where space allows and a single column for narrow windows or larger fonts.
- Internal version 1.1.0, Android version code 11, ARM64, public HTTPS API, and the same signing certificate as test8. The earlier test9 was local and does not contain the final grid fix.

### Validation and scope

- 35 mobile tests, type checks, lint, and the Android release build passed. APK integrity, package, signing certificate, and public API configuration were verified.
- 24 web-preview combinations passed across both themes/languages and six widths. All 528 Yoga layout checks passed; the previous style reproduced 192 unwanted wraps.
- The author approved the tablet preview. These checks do not replace complete native-device testing. Google Play publication and monetization remain pending.

## [1.1.0-test8] - 2026-11-11

### Android validation build

- Published a separate prerelease with internal version 1.1.0, Android version code 9, tablet support, and the latest registration password guidance. Physical-device confirmation is pending.
- Corrected the filename, checksum, and description of the existing test7 attachment in the main 1.1.0 release without changing its bytes. Preserved the previous checksum attachment.

### Web and delivery fixes

- Fixed financial summary values and compressed dashboard descriptions at tablet widths with the sidebar open. Verified dashboard, login, and registration in both themes.
- Replaced the plain letter in transactional emails with the existing Fluxo mark, used presentation tables, and corrected mobile sizing and colors.
- Updated the approved Vite+ toolchain to 1.6.0; production and complete web npm audits report zero vulnerabilities.
- Repaired the missing indirect TypeScript entry in the mobile lockfile and added mobile tests, type checks, and lint to CI. Existing mobile dependency versions are unchanged.
- Local validation: 174 PHP tests passed, two skipped, 35 mobile tests passed, static analysis/types/lint/builds passed, and 48 visual checks passed. Production image preparation also passed on Linux; these checks do not replace native APK validation.

## [1.1.1-preview] - 2026-11-08

### Added

- Templates customizados de e-mail transacional para recuperação de senha e confirmação de exclusão de conta, seguindo a identidade visual da Saldoa (logo Fluxo, laranja de destaque, DM Sans no corpo, Space Grotesk nos títulos).
- Classes Mailable `PasswordResetLink` e `AccountDeletionConfirmation` em `app/Mail/`, com views Blade em `resources/views/emails/`.
- Override de `sendPasswordResetNotification` no modelo `User` para enviar o e-mail de redefinição com o novo template.

### Improved

- E-mails de recuperação de senha e exclusão de conta agora usam layout próprio com botões de ação, avisos de expiração e rodapé da marca, em vez do template padrão do Laravel.

### Compatibility and validation

- 176 testes PHP aprovados (174 passaram, 2 ignorados por 2FA desabilitada), 1.472 assertions.
- Pint, PHPStan e builds aprovados.

## [1.1.0] - 2026-11-02

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

## [1.0.0] - 2026-09-12

First stable portfolio release, bringing together the web application created in 2025 and the mobile app created in 2026.

- Income and expenses, categories, monthly dashboards, spending budgets, and recurring transactions.
- Data export and account management.
- Mobile support for Portuguese and English, with light, dark, and system themes.
- The Saldoa Flow brand across the website and Android app.
- Public HTTPS website and API hosted on AWS with Docker.
- Gmail delivery for password recovery and email-based account deletion.
- Encrypted off-server backups by email, with recovery verified in isolated containers.
- Android ARM64 APK for direct installation, signed with a debug key.

## [mobile-v1.0.0-preview.1] - 2026-08-27

First public Android preview, using the hosted HTTPS API and supporting direct APK installation. Superseded by version 1.0.0.

[1.1.0]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.1.0
[1.0.0]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.0.0
[mobile-v1.0.0-preview.1]: https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/mobile-v1.0.0-preview.1
