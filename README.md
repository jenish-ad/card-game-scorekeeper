# Marriage Scorekeeper

An offline Android and iPhone scorekeeper for the Nepali card game Marriage. Create a match, enter each round's maal, Seen status and winner, and review standings recomputed from saved inputs. Matches stay on the device with no account or backend.

## Screenshots

Android release screenshots at the default font scale.

| Home                          | Round entry                                 | Scoreboard                                | Scoreboard (dark)                                   |
| ----------------------------- | ------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| ![Home](docs/images/home.png) | ![Round entry](docs/images/round-entry.png) | ![Scoreboard](docs/images/scoreboard.png) | ![Dark scoreboard](docs/images/scoreboard-dark.png) |

## Features

- Two to five players, ordered seating and date-based match titles.
- Direct numeric round entry, live points, optional calculation details, editing and undo.
- Per-match finish fees and working normal and Dublee finishes.
- Optional Rs per point, settlement transfers and plain-text result sharing.
- Local SQLite storage, history, finish/reopen controls and automatic dark mode.

## Scoring

Seen-only maal and per-match finish fees determine normal and Dublee scores; foul rounds use their saved penalty and mode. Every round balances to zero. Optional Rs-per-point amounts use whole paisa. See [worked scoring examples](docs/SCORING.md) for formulas, validation and settlement.

## Project structure

Routes live in `src/app`; Marriage domain rules, persistence, components and screens live in `src/features/marriage`. Shared design-system components are in `src/ui`, tokens and motion in `src/theme`, localization in `src/i18n`, migrations/providers in `src/storage`, and general helpers in `src/lib`. Source imports use `@/`.

See [architecture, data flow and SQLite schema](docs/ARCHITECTURE.md), [development notes](docs/DEVELOPMENT.md), [calendar details](docs/CALENDAR.md), and [translation review](docs/TRANSLATIONS.md).

## Tech stack

Expo SDK 58, Expo Router, React Native 0.88, React 19.3, strict TypeScript, expo-sqlite, and locally bundled Manrope/Mukta fonts. Supports changing rosters, foul rounds, optional screen wake locks, Nepali text, Devanagari digits and BS dates.

## Setup

Use Node **>=22.22 <23** and npm. Android development needs the Android SDK and a compatible JDK; iPhone development needs macOS and Xcode.

```sh
npm ci
npm start
npm run android
```

Use a development client. Rebuild it after changing native dependencies or app identifiers. `npm run ios` builds locally on macOS. An installed standalone build works offline; a development client needs Metro.

## Testing

```sh
npm run check
npm run test:coverage
npx expo install --check
npm run bundle:check
```

Checks cover formatting, architecture import rules, strict types, scoring, settings, SQLite migrations and transactional persistence, standings, settlement, sharing text and theme contrast. Coverage enforces at least 90% lines and branches for the domain and calendar layers. Bundle exports check Android and iOS JavaScript, not native device behavior. See [development notes](docs/DEVELOPMENT.md) for storage and visual verification.

## Contribution tooling

`npm ci` installs Husky hooks through `prepare`. Pre-commit runs lint-staged (Prettier and ESLint fixes on staged source); commit-msg checks Conventional Commits. Use `npm run lint:fix` and `npm run format` for local fixes. VS Code extension recommendations and format-on-save settings are included. Fill in the placeholder repository URL in `package.json`.

## Sharing source

```sh
git archive --format=zip -o marriage-scorekeeper.zip HEAD
```

This exports the committed revision, including docs and documentation images. Dependencies, caches, generated builds, temporary captures and logs are excluded.

## License

MIT — see [LICENSE](LICENSE).
