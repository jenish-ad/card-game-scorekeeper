# Development

## Runtime and setup

Use Node **22.22.0** and npm. Install dependencies with `npm ci`. Routes live in `src/app`, Marriage behavior in `src/features/marriage`, shared UI in `src/ui`, and theme tokens in `src/theme.ts`.

## Development client

Use an Expo development client. Run `npm run android` to generate the native Android project, build and install the client, and start Metro. For later sessions, run `npm start` and open the installed development client. Android builds require an Android SDK and compatible JDK. Local iPhone builds use `npm run ios` on macOS with Xcode.

Rebuild the development client after changing native dependencies or native configuration, including application identifiers and keyboard layout settings. Generated `android/` and `ios/` directories are ignored; synchronize them with app config using `npx expo prebuild` before rebuilding. Review native changes if those directories contain local customizations. A development client needs Metro; an installed standalone build runs offline.

## SQLite schema and migrations

The database is `card-game-scorekeeper.db`. Matches store titles, lifecycle dates, rule versions and settings. Players store their match, name and seat order. Rounds store their match, rule version, creation date and canonical JSON inputs. Editor drafts remain separate from persisted rounds. Totals are recomputed from stored round inputs and match settings.

Numbered migrations use `PRAGMA user_version` inside an exclusive transaction:

- Version 1 creates matches, players, rounds and lookup indexes.
- Version 2 adds match titles.
- Version 3 adds per-match settings and maps the two unreleased rule IDs to `marriage-v1`, preserving stored round inputs.

Related writes are transactional. Unknown rule versions and newer database schemas are rejected without resetting data. Tests exercise the production SQL against Node SQLite, including migration rollback and disk-backed reopening; they do not test Expo's native bridge.

## Checks

```sh
npm run check
npx expo install --check
npm run bundle:check
```

`check` runs Prettier, ESLint, strict TypeScript and Jest. The Expo check verifies dependency compatibility. Bundle checks export Android and iOS JavaScript into ignored `dist/`; they do not compile native applications or replace device testing.

Git attributes enforce LF for tracked text, while PNG, JPEG and font files remain binary. Set repository-local `core.autocrlf` to `false`, then use `git add --renormalize .` when normalizing existing files. Prettier checks LF on all platforms.

## README screenshots

Use an Android emulator with a local release build, so development-menu controls are absent:

```sh
npx expo run:android --variant release --no-bundler
adb shell settings put system font_scale 1.0
```

Prepare a demo match with five players, one long name and about six saved rounds. Capture Home, Add Round and the scoreboard. Round entry should show entered maal, one Unseen player and a selected winner. Capture the scoreboard from the top with all five player columns visible. A taller portrait emulator display can include the full standings and round table in one capture while retaining the default font scale. Restore any emulator display overrides afterward. Use demo names rather than personal match data.

```sh
adb shell screencap -p /sdcard/marriage.png
adb pull /sdcard/marriage.png screenshots/capture.png
```

Keep raw captures and local automation in ignored `screenshots/`. Resize the documentation captures to about 400 pixels wide, preserve their aspect ratio and save each PNG below 200 KB. Store only the three README images in `docs/images/`: `home.png`, `round-entry.png` and `scoreboard.png`. Inspect the resized images before committing. Add a dark-mode capture only after actually capturing it and updating the README link.

For the Android keyboard check, open Add Round with five players and focus the last player's maal field. Confirm that the field and Save round footer remain above the keyboard. Android uses react-native-keyboard-controller for keyboard avoidance, with automatic positioning relative to the screen and automatic scrolling that reserves the measured footer height. Its provider is mounted only on Android; iOS retains React Native keyboard avoidance. Rebuild after adding or updating the controller. Repeat the keyboard check after native keyboard configuration changes; bundling alone cannot verify this behavior.

## Sharing source

```sh
git archive --format=zip -o marriage-scorekeeper.zip HEAD
```

The archive includes committed source, docs and documentation images. Git attributes exclude dependencies, generated native projects, Expo caches, build output, scratch screenshots, logs and other archives. Uncommitted changes are not included.
