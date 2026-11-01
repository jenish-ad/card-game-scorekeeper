# Marriage Scorekeeper

Offline Android and iPhone scorekeeper for Nepali Marriage, built with Expo SDK 58, Expo Router, React Native 0.88, React 19.3, and strict TypeScript.

## What works

- Set a match title, add 2–5 players, drag to arrange seating, and start a match.
- Home, History, and Rules tabs, with Setup, Scoreboard, Add/Edit Round, and Round Preview stack screens.
- Enter whole-number maal with steppers, seen status, and a winner; choosing the winner marks them Seen.
- Review calculated points before saving a round.
- View ranked totals and a horizontally scrolling round table with a fixed round column. Tap a round to inspect its inputs and calculation, edit it, or delete it with confirmation.
- Finish/reopen matches, browse history, and resume saved matches after restarting.
- Retry storage initialization and failed reads/writes without resetting saved history.

Unsaved setup and round edits are temporary. Only a successful Save persists them. Data stays on this device: no backend, account, sync, or analytics. Uninstalling or clearing app storage can remove history; backup/export is not implemented.

## Windows setup and checks

Use **Node 22.22.0** and npm **10.9.0**. The `.nvmrc` pins this project's Node version. Node 22.22.0 was installed alongside the existing 22.12 runtime using NVM; the older runtime was retained. On another machine, install/select 22.22.0 before running these commands. Git 2.55.0 is suitable.

```powershell
Set-Location 'C:\Users\jenis\Desktop\Projects\card-game-scorekeeper'
node --version
npm.cmd ci
npm.cmd run check
npx.cmd expo install --check
npm.cmd run bundle:check
```

Commands:

- `npm.cmd start`: Metro for the development client.
- `npx expo start`: also starts Metro; use a development build on a device or emulator.
- `npm.cmd run android`: generate ignored native files and build the Android development client locally.
- `npm.cmd run ios`: local iOS build; requires macOS and Xcode.
- `npm.cmd run format`: apply Prettier.
- `npm.cmd run check`: formatting, ESLint, strict types, and automated tests.
- `npm.cmd test`: Jest tests for pure scoring, validation, transactional storage, and migrations against real SQLite.
- `npm.cmd run bundle:check`: export Android/iOS JavaScript into ignored `dist/`; this does not compile native apps or test devices.

GitHub Actions uses the lockfile and runs checks, Expo dependency compatibility, and both bundle exports. ESLint 9 is retained because Expo's React lint plugin failed with ESLint 10.

## Development builds and devices

Use development builds rather than Expo Go. **Rebuild an existing development client after updating native dependencies, including SQLite and fonts.** For Android on Windows, install Android Studio, Android SDK/emulator and a compatible JDK (currently JDK 17 per Expo setup guidance), configure `ANDROID_HOME`, and start an emulator or connect a USB-debugging device:

```powershell
npm.cmd run android
npm.cmd start
```

Windows cannot run Xcode or an iOS Simulator. For a physical iPhone, configure an EAS cloud development build with an Expo account and Apple signing credentials, usually a paid Apple Developer membership. Choose permanent app identifiers during configuration; none are assigned here.

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build:configure
npx.cmd eas-cli@latest device:create
npx.cmd eas-cli@latest build --platform ios --profile development
npm.cmd start
```

Register the iPhone before building, install via the EAS build link, and connect the installed development client to Metro on the same reachable network. Android cloud builds can use `npx.cmd eas-cli@latest build --platform android --profile development`. These cloud commands have not been executed. Development needs Metro; offline operation refers to an installed standalone app.

References: [SDK compatibility](https://docs.expo.dev/versions/v58.0.0/), [local development](https://docs.expo.dev/guides/local-app-development/), [development builds](https://docs.expo.dev/develop/development-builds/introduction/), [iOS distribution](https://docs.expo.dev/build/internal-distribution/).

## Scoring preset

New matches display **Pagat base v1** and use the user-specified calculation in `src/scoring/pagatBaseV1.ts`. With `n` players, total maal is the sum over Seen players only. Each non-winner receives `n × (seen ? maal : 0) − totalMaal − (seen ? 3 : 10)`. The winner receives the opposite of the other players' combined points. Totals are recomputed from canonical inputs and always balance to zero.

**Open Dublee TODO:** `dubleeAdjustment()` throws exactly `Dublee rule not configured`. The editor lets the user select Dublee but blocks preview/save with that message. No new Dublee adjustment is assumed.

The earlier app already saved `pagat-base-v1` with different behavior. To keep historical matches reproducible, new matches store the revision `pagat-base-v1-seen-maal`; existing matches keep `pagat-base-v1`. Both match and round records carry the exact revision. The original calculation stays unchanged in `src/features/marriage/scoring.ts`.

### Historical preset (existing matches only)

The original **Pagat base v1**, identified by `pagat-base-v1`, follows the [published reference](https://www.pagat.com/rummy/marriage.html#scoring).

Players enter their already-counted eligible maal totals. The app does not inspect cards or judge meld eligibility. The preset accepts 2–5 players and nonnegative whole-number maal. A winner must be seen. Each opponent pays a finish amount of 3 if seen or 10 if unseen, with 5 more for a dublee win. Each player's net also includes their maal exchange with every other player. Results conserve points, and the finishing player can have a net loss. No currency conversion or rounding is needed.

This is the published base settlement, with **no automatic Murder/Kidnap adjustments** to entered maal. Unseen status changes the finish payment. Tables that use other eligibility/transfer rules need a separate agreed rule version; do not silently change this preset.

Worked examples (also tested): Sita wins normally with 5 maal; Ram has 2 and is seen; Hari has 0 and is unseen. Results are Sita +21, Ram −4, Hari −17. With a dublee win they become +31, −9, −22.

## Structure and storage

- `src/app/(tabs)`: Home, History, Rules & About.
- `src/app/marriage`: Setup, Scoreboard, Add/Edit Round, and Round Preview/Details routes.
- `src/theme.ts`: shared colors, typography, radii, spacing, and touch-target tokens.
- `src/scoring/pagatBaseV1.ts`: current pure scoring function, version dispatcher, and open Dublee TODO.
- `src/features/marriage`: historical scoring, validation, match persistence operations, the round editor, and temporary round draft context.
- `src/storage`: SQLite initialization, schema migration, and the React storage context.
- `src/ui`: shared screen container and styles.
- `tests`: Jest scoring and storage tests; TypeScript is transpiled for Jest while `tsc` checks strict types separately.

Fraunces headings and Manrope UI fonts are bundled from `@expo-google-fonts` packages and loaded locally. There are no runtime font downloads. Scores use tabular numbers and signed text plus Gains/Pays/No change labels. Safe areas and keyboard-aware sticky actions are shared across screens.

The supplied seven-screen overview is the visual reference. No individual files were present in `design/mockups/`. The implementation follows its cream/forest/gold palette, cards, typography, and screen hierarchy while using the requested minimum touch sizes. A native screenshot comparison is still required on Android and iPhone.

`expo-sqlite` stores `card-game-scorekeeper.db` in the app's SQLite directory. Schema version 1 contains matches (preset and lifecycle dates), ordered match players, and rounds (canonical JSON inputs, exact rule version, and creation date). Version 2 adds match titles transactionally; older matches receive a display fallback such as “Match 1.” All user values are SQL parameters. Readers validate records and reject unknown rule versions or newer schemas without resetting the database.

Schema changes use numbered `PRAGMA user_version` migrations inside transactions. Related writes use exclusive transactions; a failed player insert rolls back its match too. Round corrections replace the canonical input; deletions remove it. Scoreboards are recomputed from all remaining inputs using the recorded rule version, avoiding cached totals that can drift. Finished matches reject round writes until reopened. WAL is enabled for the database. No schema changes are required on restart when version 2 is already installed.

## Verification and remaining work

Automated tests use Node's SQLite implementation to run the actual schema and repository SQL against real SQLite, including a disk-backed close/reopen test. They cover migration rollback/idempotency, write rollback, saved seating and rounds, correction/deletion totals, finish/reopen restrictions, corruption, wrong-match players, scoring examples, and conservation across player counts. This tests persistence behavior; it does not test Expo's native bridge.

Run `npm run check`, `npx expo install --check`, and `npm run bundle:check` with Node 22.22.0 before finishing an increment. VS Code workspace settings point to the installed TypeScript SDK; after changing SDK selection, restart its TypeScript server if stale JSX diagnostics remain.

This increment passed formatting, lint, strict TypeScript, and 24 Jest tests. Android and iOS Hermes bundle exports also passed. Expo dependency compatibility passed using the installed SDK's local dependency map when its online endpoint was unavailable.

No Android/iPhone device test has been performed. Device checks still needed: save/restart/resume, confirmation dialogs, keyboard scrolling, large text, screen readers, touch targets, interrupted writes, and low-storage failures. GitHub Actions has not been run remotely. Callbreak, backup/export, other scoring variants, and cloud sync are outside this increment.

Dependency audit findings change with registry advisories. Review `npm audit` before release; do not apply forced framework downgrades without reviewing compatibility.
