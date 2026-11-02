export function nextSeenPlayerIndex(
  players: readonly { seen: boolean }[],
  current: number,
): number {
  return players.findIndex((player, index) => index > current && player.seen);
}

export function setPlayerSeen<T extends { seen: boolean; maal: string }>(
  player: T,
  seen: boolean,
): T {
  return { ...player, seen, maal: seen ? player.maal : '0' };
}
export function savedRoundToken(): string {
  return String(Date.now());
}
