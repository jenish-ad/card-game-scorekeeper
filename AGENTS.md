# Working in this repository

- Target Android and iPhone with Expo, Expo Router, npm, and strict TypeScript.
- Use Node 22.22.0. Keep package-lock.json in sync with package.json.
- Keep routes in src/app, Marriage behavior in src/features/marriage, and shared UI in src/ui.
- The user owns scoring rules. Never invent formulas, player-count limits, or rule variants. The user authorized standard rules: the implemented preset is `pagat-base-v1`, documented in README.md. Keep historical rule versions reproducible.
- Use domain names, focused functions, explicit control flow, and comments that explain intent. Avoid speculative abstractions and unrelated refactoring.
- Add tests for observable behavior and realistic examples. Before finishing an increment, review the diff for naming, consistency, unused work, and complexity.
- Run npm run check, npx expo install --check, and npm run bundle:check. Report checks that could not run, and never claim device testing without doing it.
- Future persistence uses SQLite with explicit transactional migrations. Store canonical round inputs and their rule version; keep draft UI state separate.
- Do not commit, push, publish, or start paid services without a user request.
