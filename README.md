# Card Game Scorekeeper

Offline Android and iPhone scorekeeper for Nepali Marriage, built with Expo SDK 58, Expo Router, React Native 0.88, React 19.3, and strict TypeScript.

## What works

- Set up 2–5 players, review their names, and save a match.
- Enter eligible maal totals, seen status, a winner, and normal/dublee finish.
- Review calculated points before saving a round.
- View the scoreboard and round inputs/results; correct or delete a round with confirmation and recalculation.
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
- `npm.cmd run android`: generate ignored native files and build the Android development client locally.
- `npm.cmd run ios`: local iOS build; requires macOS and Xcode.
- `npm.cmd run format`: apply Prettier.
- `npm.cmd run check`: formatting, ESLint, strict types, and automated tests.
- `npm.cmd run bundle:check`: export Android/iOS JavaScript into ignored `dist/`; this does not compile native apps or test devices.

GitHub Actions uses the lockfile and runs checks, Expo dependency compatibility, and both bundle exports. ESLint 9 is retained because Expo's React lint plugin failed with ESLint 10.

## Development builds and devices

Use development builds rather than Expo Go. **Rebuild an existing development client after adding SQLite.** For Android on Windows, install Android Studio, Android SDK/emulator and a compatible JDK (currently JDK 17 per Expo setup guidance), configure `ANDROID_HOME`, and start an emulator or connect a USB-debugging device:

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

The user's instruction to use standard rules is implemented as **Pagat base v1**, identified by `pagat-base-v1`. [Published reference](https://www.pagat.com/rummy/marriage.html#scoring).

Players enter their already-counted eligible maal totals. The app does not inspect cards or judge meld eligibility. The preset accepts 2–5 players and nonnegative whole-number maal. A winner must be seen. Each opponent pays a finish amount of 3 if seen or 10 if unseen, with 5 more for a dublee win. Each player's net also includes their maal exchange with every other player. Results conserve points, and the finishing player can have a net loss. No currency conversion or rounding is needed.

This is the published base settlement, with **no automatic Murder/Kidnap adjustments** to entered maal. Unseen status changes the finish payment. Tables that use other eligibility/transfer rules need a separate agreed rule version; do not silently change this preset.

Worked examples (also tested): Sita wins normally with 5 maal; Ram has 2 and is seen; Hari has 0 and is unseen. Results are Sita +21, Ram −4, Hari −17. With a dublee win they become +31, −9, −22.

## Structure and storage

- `src/app`: routes for home, setup, history, and the match scoreboard.
- `src/features/marriage`: pure scoring and validation, match persistence operations, and the round editor.
- `src/storage`: SQLite initialization, schema migration, and the React storage context.
- `src/ui`: shared screen container and styles.

`expo-sqlite` stores `card-game-scorekeeper.db` in the app's SQLite directory. Schema version 1 contains matches (preset and lifecycle dates), ordered match players, and rounds (canonical JSON inputs, exact rule version, and creation date). All user values are SQL parameters. Readers validate records and reject unknown rule versions or newer schemas without resetting the database.

Schema changes use numbered `PRAGMA user_version` migrations inside transactions. Related writes use exclusive transactions; a failed player insert rolls back its match too. Round corrections replace the canonical input; deletions remove it. Scoreboards are recomputed from all remaining inputs using the recorded rule version, avoiding cached totals that can drift. Finished matches reject round writes until reopened. WAL is enabled for the database. No schema changes are required on restart when version 1 is already installed.

## Verification and remaining work

Automated tests use Node's SQLite implementation to run the actual schema and repository SQL against real SQLite, including a disk-backed close/reopen test. They cover migration rollback/idempotency, write rollback, saved seating and rounds, correction/deletion totals, finish/reopen restrictions, corruption, wrong-match players, scoring examples, and conservation across player counts. This tests persistence behavior; it does not test Expo's native bridge.

Verified using the project's pinned Node 22.22 runtime: `npm run check` (formatting, lint, types, 16 passing tests), `npx expo install --check`, and `npm run bundle:check` for both platforms. VS Code workspace settings point to the installed TypeScript SDK; after changing SDK selection, restart its TypeScript server if stale JSX diagnostics remain.

No Android/iPhone native build or device test has been performed. Device checks still needed: save/restart/resume, confirmation dialogs, keyboard scrolling, large text, screen readers, touch targets, interrupted writes, and low-storage failures. GitHub Actions has not been run remotely. Callbreak, backup/export, other scoring variants, and cloud sync are outside this increment.

Dependency audit reports 26 findings (2 low, 22 moderate, 2 high) from the inherited dependency tree after compatible fixes. Forced fixes proposing framework downgrades were not applied. Review these before release.
