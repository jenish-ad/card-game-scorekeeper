import { AppError, type ErrorCode } from '../../errors';
export type PlayerNamesResult =
  | { ok: true; playerNames: string[] }
  | { ok: false; message: string; error: AppError };

function failure(code: ErrorCode): PlayerNamesResult {
  const error = new AppError(code);
  return { ok: false, message: error.message, error };
}
// This validates a setup draft, not Marriage player-count rules.
export function validatePlayerNames(
  names: readonly string[],
): PlayerNamesResult {
  const playerNames = names.map((name) => name.trim());
  if (
    playerNames.length === 0 ||
    playerNames.some((name) => name.length === 0)
  ) {
    return failure('PLAYER_NAME_REQUIRED');
  }
  if (playerNames.some((name) => name.length > 40)) {
    return failure('PLAYER_NAME_TOO_LONG');
  }
  const distinctNames = new Set(playerNames.map((name) => name.toLowerCase()));
  if (distinctNames.size !== playerNames.length) {
    return failure('PLAYER_NAME_DUPLICATE');
  }
  return { ok: true, playerNames };
}
