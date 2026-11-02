# Development

## Runtime and setup

Use Node **>=22.22 <23** and npm. Install dependencies with `npm ci`. Routes live in `src/app`, pure Marriage rules in `src/features/marriage/domain`, repository/hooks in `data`, feature views in `components` and screen composition in `screens`, shared UI in `src/ui`, and theme tokens in `src/theme/tokens.ts`.

## Development client

Use an Expo development client. Run `npm run android` to generate the native Android project, build and install the client, and start Metro. For later sessions, run `npm start` and open the installed development client. Android builds require an Android SDK and compatible JDK. Local iPhone builds use `npm run ios` on macOS with Xcode.

Rebuild the development client after changing native dependencies or native configuration, including application identifiers and keyboard layout settings. Generated `android/` and `ios/` directories are ignored; synchronize them with app config using `npx expo prebuild --no-clean` before rebuilding. Review native changes if those directories contain local customizations. A development client needs Metro; an installed standalone build runs offline.

## SQLite schema and migrations

The database is `card-game-scorekeeper.db`. Matches store titles, lifecycle dates, rule versions and settings. Players store their match, name and seat order. Rounds store their match, rule version, creation date and canonical JSON inputs. Editor drafts remain separate from persisted rounds. Totals are recomputed from stored round inputs and match settings.

Numbered migrations use `PRAGMA user_version` inside an exclusive transaction:

- Version 1 creates matches, players, rounds and lookup indexes.
- Version 2 adds match titles.
- Version 3 adds per-match settings and maps the two unreleased rule IDs to `marriage-v1`, preserving stored round inputs.
- Version 4 adds player active status and nullable join timestamps. Historical round participant lists remain unchanged.
- Version 5 adds app preferences for language, numerals, calendar and keep-awake.
- Version 6 clears exact historical generated titles. Empty titles are displayed using the current date preferences; typed titles are preserved.
- Version 7 preserves joining-order color assignments, including color history for removed unplayed players.

Migration modules are in `src/storage/migrations`; the runner and connection contracts remain in `src/storage/database.ts`. See [architecture](ARCHITECTURE.md) for the unchanged version-7 schema and dependency rules.

Related writes are transactional. Unknown rule versions and newer database schemas are rejected without resetting data. Tests exercise the production SQL against Node SQLite, including migration rollback and disk-backed reopening; they do not test Expo's native bridge.

## Checks

```sh
npm run check
npm run test:coverage
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

Keep raw captures and local automation in ignored `screenshots/`. Resize the documentation captures to about 400 pixels wide, preserve their aspect ratio and save each PNG below 200 KB. Store only the four README images in `docs/images/`: `home.png`, `round-entry.png`, `scoreboard.png` and `scoreboard-dark.png`. Inspect the resized images before committing. Add a dark-mode capture only after actually capturing it and updating the README link.

For the Android keyboard check, open Add Round with five players and focus the last player's maal field. Confirm that the field and Save round footer remain above the keyboard. Android uses react-native-keyboard-controller for keyboard avoidance, with automatic positioning relative to the screen and automatic scrolling that reserves the measured footer height. Its provider is mounted only on Android; iOS retains React Native keyboard avoidance. Rebuild after adding or updating the controller. Repeat the keyboard check after native keyboard configuration changes; bundling alone cannot verify this behavior.

## Sharing source

```sh
git archive --format=zip -o marriage-scorekeeper.zip HEAD
```

The archive includes committed source, docs and documentation images. Git attributes exclude dependencies, generated native projects, Expo caches, build output, scratch screenshots, logs and other archives. Uncommitted changes are not included.

## Roster, fouls and localization

Only active players enter new rounds. An edited round retains its original participant set. Players with historical rounds remain in standings after leaving; unplayed players are deleted on removal. Names are unique across the whole roster, including departed players. At most five players can be active; at least two remain.

Normal rounds without a `kind` key remain supported. Foul inputs store the penalty and mode at save time, and editing a saved foul retains its snapshot. Fixed-total remainders follow match seating order. Settings JSON from v3 fills the new foul defaults without changing normal scores.

Preferences load before the navigator. Rules contains app settings; setup Rules contains match scoring settings. Inputs and database numbers remain Latin; maal accepts Devanagari keystrokes. UI formatting uses typed dictionaries and numeral helpers. Nepali typography uses Mukta 500/600/700/800. Sleep prevention mounts only for focused active match, entry and preview screens while enabled. Native module changes require rebuilding the development client.

See [calendar verification](CALENDAR.md) and [translation review](TRANSLATIONS.md). Calendar dates outside the supported table fall back to AD. Native review is still required for the Nepali wording.

## Motion and player colors

`MotionProvider` owns the single accessibility read and subscription. Motion stays disabled until the setting resolves. `ScoreText` always shows its current value immediately, defaults to static text, and only fades/slides after an opted-in value change. Standings totals opt in; tables, previews, entry chips, match cards and settlement amounts remain static. No React state updates run per animation frame.

Schema version 7 stores palette assignments in `player_colors`, separate from seating. Existing rosters are backfilled in player creation order. New players receive unused colors first, then a color whose owner has left. Color history survives removal of players who never played, so seat gaps and departures cannot renumber active colors. A returning player keeps their old color when free, or receives another available color if it was reused.

## Documentation screenshots and icon

The README images are from a non-debuggable Android release at 360dp and font scale 1.0, using a demo match with five historical players, six rounds, a foul, and a departed player. The entry screen correctly includes only the four active players. Images are 400px wide and below 200 KB; the fourth image shows the dark scoreboard.

`assets/brand/kq-mark.svg` and `src/ui/kqPaths.ts` share letter paths outlined from the bundled Manrope 800 font, plus geometric diamond and heart paths. The iOS icon is an opaque 1024px RGB square; adaptive Android artwork remains inside the 66% safe zone.

## Imports, tests and hooks

`@/` maps to `src/` in TypeScript, Expo/Metro and Jest. Use it for imports crossing top-level source folders. Domain cannot import React, React Native, Expo, storage, localization or UI. Generic UI cannot import features. ESLint enforces both boundaries.

Unit tests live in `tests/unit`; SQLite migrations, repository persistence and regression tests live in `tests/integration`. The shared SQLite test adapter is in `tests/integration/helpers`. `npm run test:coverage` enforces 90% line/branch coverage separately for domain and calendar directories. The aggregate domain threshold includes pure models; it is not a per-file exclusion for error branches.

`npm run prepare` installs Husky hooks (also run by npm install/ci). Pre-commit runs lint-staged: Prettier and ESLint fixes for staged source, and Prettier for staged JSON/Markdown/YAML. Commit-msg uses `@commitlint/config-conventional`. Example: `refactor: organize marriage feature layers`. No hook makes a commit automatically.

The scripts `lint:fix` and `format` apply fixes; `lint`, `format:check` and `typecheck` are read-only checks. `.editorconfig` enforces UTF-8, LF, two spaces, a final newline and trimmed trailing whitespace. `.vscode/extensions.json` recommends ESLint, Prettier and EditorConfig; workspace settings only enable format on save.

Expo-managed dependency ranges match the SDK compatibility list via `npx expo install --fix`. `expo-linear-gradient` remains in use for the round table's horizontal overflow cue. `expo-constants` and `expo-linking` are required Expo Router peers. React DOM is not a direct dependency of this native-only application.
