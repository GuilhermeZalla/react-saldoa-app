This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Saldoa identity and preferences

- Match the existing desktop identity: orange accent, neutral surfaces, DM Sans body text, Space Grotesk headings and the approved Flow mark (S with incoming/outgoing arrows). Use `src/theme.ts` tokens for both themes.
- Use `useThemeStyles` for theme-dependent styles. Keep font families explicit in text styles.
- Translate app text with `src/i18n.ts`; preserve user-entered names and descriptions. Support Portuguese and English and keep all financial amounts in BRL.
- Language and light/dark/system preferences live in `PreferencesContext` and are saved per device, separately from authentication.
- Use safe-area insets for screens and bottom tabs. Android system bars are hidden using the SDK 58 declarative components; gestures can reveal them temporarily. Do not hard-code status bar or navigation bar heights.
- Keep native behavior in app config/plugins. Launcher/adaptive/monochrome/splash assets must use the approved Saldoa Flow mark, never Expo or React Native defaults.
- Keep login/register focused on authentication: preferences open from the top settings button and the demo is a quiet link only when a valid demo URL is configured. Do not expose environment variable names or API hosts on the access screen. Demo visibility is independent of build type.
- Reuse `PreferencesSheet`, `SettingsRow`, `UserAvatar` and `ProgressBar`; keep the vector illustration local and theme-aware. Preserve password/confirmation safeguards when presenting account deletion in a collapsed section.
- Run `npm test`, `npm run types:check` and `npm run lint` for changes to preferences, localization or formatting. Validate Android bars on an emulator or physical phone; a web preview cannot prove native behavior.
- Use `npm run apk:local` for local APKs without EAS. Preserve private-host-only HTTP, `arm64-v8a`, the Windows short paths, bounded compiler concurrency and cleanup. Keep `android`/`ios` scripts as `expo start --android` / `expo start --ios`; prebuild may rewrite them and the APK script must restore them.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
