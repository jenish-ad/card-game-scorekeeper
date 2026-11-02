# Implementation report

Implemented the four phases in order. All changes are uncommitted. No source archive was created.

## Behavior and migrations

- **v4:** Adds `players.active` (existing players default active) and nullable `players.joined_at`. Add/remove/rejoin operations are exclusive transactions and reject finished matches. Deleting an unplayed player leaves stable seat numbers; departures with rounds preserve historical scores. New rounds default to active players; edits retain original participants. Standings and settlement retain departed players. Round cells for nonparticipants show a muted en dash.
- **Fouls:** Backward-compatible normal/foul union; legacy JSON without `kind` remains normal. New settings default to per-player penalty 10. Saving a foul snapshots the match penalty and mode, sorting participants by seat before fixed-total remainder allocation. Edits preserve a saved foul's snapshot. Entry has a Record foul choice with live offender preview; details, table markers and undo support fouls.
- **v5:** Adds `app_preferences`. Language, numerals, calendar and keep-awake are read through the provider and saved through SQLite upserts. Device language comes from expo-localization when no language preference exists; other defaults are Latin/AD/keep-awake on.
- **Localization:** Typed English/Nepali dictionaries, interpolation, count plurals, numeral formatting and Devanagari maal input normalization. Scores, counts, totals, round numbers, amounts, accessibility labels, errors and share/settlement text use the helpers. Month names also live in dictionaries. Mukta typography is selected for Nepali text or Devanagari numerals, including shared styles. Numeral choice labels retain their distinct scripts.
- **Screen awake:** Unique hook-owned locks on focused active scoreboard/editor/preview screens. Finished matches and disabled preferences release them. Expo's development wrapper adds its own default wake lock when this package is installed; the app removes that development-only tag after fonts load so the preference works in development too.

## New direct dependencies

| Dependency                 | Reason                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `expo-keep-awake`          | Focused active-match screen wake locks; installed with Expo's SDK-compatible installer    |
| `expo-localization`        | Device language default; installed with Expo's SDK-compatible installer and config plugin |
| `@expo-google-fonts/mukta` | Devanagari glyphs; direct imports bundle/load only 400, 600 and 700                       |

No i18n framework or calendar dependency was added.

## Validation

- Phase 1: `npm run check` passed, 46 tests.
- Phase 2: `npm run check` passed, 53 tests.
- Phase 3: `npm run check` passed, 53 tests.
- Final: `npm run check` passed, **72 tests in 11 suites**, including formatting, lint and strict TypeScript.
- `npx expo install --check`: dependencies up to date.
- `npm run bundle:check`: Android and iOS exports pass.
- Native Android development build: `npx expo run:android --no-bundler` passed and installed the new native modules.
- Android API 37 emulator at **360dp** (1080px / density 480): inspected Nepali headers, five-player entry rows, long-name truncation, round table headers, five-player score footer and foul details with Devanagari scores. No horizontal overflow in those inspected views. Input fields intentionally retain Latin values; typed Devanagari digits normalize before parsing.
- Native Android window inspection: `KEEP_SCREEN_ON` present on active scoreboard and preview; absent on a finished scoreboard, after leaving the match, and on an active scoreboard with the preference off. Reopening restored the lock. The tested match was restored to active, its six rounds were unchanged, app preferences restored to English/Latin/AD/on, and emulator density restored to 420.
- JSX/Alert literal audit found no remaining hardcoded English display strings. Typed English dictionary keys in Rules are passed to `t`; development-client Tools/OS navigation chrome are supplied by Expo/Android.
- SQLite tests cover old-schema migration with data, rollback, reopening preferences, joins after two rounds, original participant edits after departures, caps, minimums, rejoining, unplayed-row deletion, departed-player settlement, foul snapshots after settings changes and mixed roster changes. Pure tests cover both foul modes with 2–5 players, fixed-total remainders, zero/unsafe penalties, legacy inputs, dictionary parity, plurals, numerals and BS dates.

## Calendar and translation limits

[Calendar verification](CALENDAR.md) records sources for every Baisakh 1 from 2075 through 2085, plus 2080-01-16, 2080-01-31 and 2083-07-16. All these vectors agree with Hamro Patro's published calendars and the embedded table. Government sources corroborate several years; **the requested full official-calendar cross-check remains incomplete**, especially 2082, 2084 and 2085. Future calendar month lengths remain subject to official revision. No unverified official vector is claimed.

[Translation review](TRANSLATIONS.md) lists every Nepali entry beside its English source. All entries need native review. Highest-priority uncertainties are finish fees, scoring explanations, opposite/combined points, settlement wording, database/overflow errors, month transliterations and the “Left” tag. The requested माल / सिन / अनसिन / डबली / फाउल / राउन्ड / रु. terms are used.

No native iOS device testing was available; its JavaScript export passes. Android inspection covered standard font scale at 360dp, not every accessibility font scale or keyboard. Calendar dates outside BS 2000–2100 fall back to AD in the UI. Stored timestamps and titles are preserved; newly generated titles use the selected date preferences. Existing stored titles are not retranslated, since the schema does not distinguish typed titles from generated ones.

## Files changed

- `README.md`
- `app.json`
- `docs/CALENDAR.md`
- `docs/DEVELOPMENT.md`
- `docs/IMPLEMENTATION_REPORT.md`
- `docs/TRANSLATIONS.md`
- `package-lock.json`
- `package.json`
- `src/app/(tabs)/_layout.tsx`
- `src/app/(tabs)/history.tsx`
- `src/app/(tabs)/index.tsx`
- `src/app/(tabs)/rules.tsx`
- `src/app/_layout.tsx`
- `src/app/marriage/match/[id].tsx`
- `src/app/marriage/players/[id].tsx`
- `src/app/marriage/preview/[id].tsx`
- `src/app/marriage/round/[id].tsx`
- `src/app/marriage/settle/[id].tsx`
- `src/app/marriage/setup.tsx`
- `src/features/marriage/RoundDraftProvider.tsx`
- `src/features/marriage/RoundEditor.tsx`
- `src/features/marriage/matchTitle.ts`
- `src/features/marriage/matches.ts`
- `src/features/marriage/playerNames.ts`
- `src/features/marriage/roundPreview.ts`
- `src/features/marriage/scoring.ts`
- `src/features/marriage/settlement.ts`
- `src/features/marriage/useMatches.ts`
- `src/i18n/bikramSambat.ts`
- `src/i18n/dates.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`
- `src/i18n/ne.ts`
- `src/i18n/numbers.ts`
- `src/storage/MatchStorageProvider.tsx`
- `src/storage/PreferencesContext.ts`
- `src/storage/PreferencesProvider.tsx`
- `src/storage/database.ts`
- `src/storage/preferences.ts`
- `src/theme.ts`
- `src/ui/DraggableSeat.tsx`
- `src/ui/MatchCard.tsx`
- `src/ui/MatchKeepAwake.tsx`
- `src/ui/Primitives.tsx`
- `src/ui/RoundTable.tsx`
- `src/ui/SavedRoundNotice.tsx`
- `src/ui/ScoreboardActions.tsx`
- `src/ui/Screen.tsx`
- `src/ui/StandingsBoard.tsx`
- `src/useTheme.ts`
- `tests/fouls.test.ts`
- `tests/i18n.test.ts`
- `tests/matches.test.ts`
- `tests/settings.test.ts`
- `tests/settlement.test.ts`
- `tests/standings.test.ts`
