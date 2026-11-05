# Saldoa Mobile

A personal finance app created in **2026**, extending the Saldoa web application completed in **2025**.

**[Download the Android APK](https://github.com/GuilhermeZalla/react-saldoa-app/releases/download/v1.1.0/saldoa-android-v1.1.0.apk)** · [Release notes](https://github.com/GuilhermeZalla/react-saldoa-app/releases/tag/v1.1.0) · [Visit the web application](https://saldoa-app.duckdns.org)

Version **1.1.0** refreshes the dashboard, transaction history, and planning screens. It adds month navigation, search, pagination, and four main tabs. The sign-in and registration design is preserved. Navigation from More and password-validation messages have also been improved.

See the [changelog](../CHANGELOG.md) for the complete version history. Android version code **3** was tested on a physical device by the author.

## Preview

<p>
  <img src="../docs/screenshots/mobile-login-expo.png" alt="Mobile sign-in screen" width="240">
  <img src="../docs/screenshots/mobile-dashboard-expo.png" alt="Financial overview" width="240">
  <img src="../docs/screenshots/mobile-budgets-expo.png" alt="Spending budgets" width="240">
</p>

Screenshots from the app's web preview, using sample data.

## Features

Dashboard, income and expenses, categories, spending budgets, recurring transactions, data export, and account management. Available in Portuguese and English, with light, dark, and system themes.

More screens: [Sign up](../docs/screenshots/mobile-register-expo.png) · [Transactions](../docs/screenshots/mobile-transactions-expo.png) · [Transaction form](../docs/screenshots/mobile-transaction-form-expo.png) · [Categories](../docs/screenshots/mobile-categories-expo.png) · [Recurring transactions](../docs/screenshots/mobile-recurring-expo.png) · [Account](../docs/screenshots/mobile-account-expo.png) · [Preferences in English](../docs/screenshots/mobile-preferences-en.png) · [Dashboard in English](../docs/screenshots/mobile-dashboard-en.png).

## Install

1. Download the APK from GitHub Releases on your Android phone.
2. Allow installation from your browser or file manager if Android asks.
3. Open Saldoa and create an account, or sign in with your account from the hosted website.
4. Use it over Wi-Fi or mobile data.

The APK connects to the public API. Laravel does not need to be running on your computer. Local development accounts and data are separate from the AWS deployment.

The APK supports **Android ARM64** and uses a **debug signing key**. It is available for direct installation and is not published on Google Play. Distribution signing and store publishing are outside the scope of this release.

Password recovery and email-based account deletion use the website. Gmail SMTP is configured, and both complete flows were confirmed by the author.

## Run the source code

From the repository root, using PowerShell:

```powershell
if (!(Test-Path mobile/.env)) {
    Copy-Item mobile/.env.example mobile/.env
}
cd mobile
npm ci
```

Keep any existing environment configuration. To use the public server, set these values in `mobile/.env`:

```dotenv
EXPO_PUBLIC_API_URL=https://saldoa-app.duckdns.org
EXPO_PUBLIC_WEB_URL=https://saldoa-app.duckdns.org
EXPO_PUBLIC_API_URL_DEMO=
```

Run `npm start`. Use an Expo Go version compatible with this project on your phone, or run `npm run web` to open the browser preview.

For a local API, use your computer's LAN IP and port 8000 for both URLs. Start Laravel from the repository root with `php artisan serve --host=0.0.0.0 --port=8000`, and connect the phone and computer to the same Wi-Fi network.

## Build an APK

Requires Android Studio, Android SDK, and Java. From `mobile`, to use the public API:

```powershell
$env:EXPO_PUBLIC_API_URL = 'https://saldoa-app.duckdns.org'
$env:EXPO_PUBLIC_WEB_URL = 'https://saldoa-app.duckdns.org'
$env:EXPO_PUBLIC_API_URL_DEMO = ''
npm run apk:local -- --public-api
```

The output is `android/app/build/outputs/apk/release/app-release.apk`. For local testing with a private HTTP API, configure the LAN address in `.env` and run `npm run apk:local` without the public API flag. Changing the API URL requires a new build.

## Checks

```powershell
npm test
npm run types:check
npm run lint
```

See [MOBILE_API.md](../docs/MOBILE_API.md) for API contracts and security notes in Portuguese. The [main README](../README.md) introduces the complete project.
