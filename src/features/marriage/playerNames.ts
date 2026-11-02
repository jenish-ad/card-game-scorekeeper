import { t } from '../../i18n';
export type PlayerNamesResult =
  { ok: true; playerNames: string[] } | { ok: false; message: string };

// This validates a setup draft, not Marriage player-count rules.
export function validatePlayerNames(
  names: readonly string[],
): PlayerNamesResult {
  const playerNames = names.map((name) => name.trim());
  if (
    playerNames.length === 0 ||
    playerNames.some((name) => name.length === 0)
  ) {
    return {
      ok: false,
      message: t('Enter a name for every player, or remove the empty player.'),
    };
  }
  if (playerNames.some((name) => name.length > 40)) {
    return {
      ok: false,
      message: t('Keep each player name to 40 characters or fewer.'),
    };
  }
  const distinctNames = new Set(playerNames.map((name) => name.toLowerCase()));
  if (distinctNames.size !== playerNames.length) {
    return {
      ok: false,
      message: t(
        'Use a different name for each player so scores can be distinguished.',
      ),
    };
  }
  return { ok: true, playerNames };
}
