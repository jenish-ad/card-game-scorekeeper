export function nextSeenPlayerIndex(
  players: readonly { seen: boolean }[],
  current: number,
): number {
  return players.findIndex((player, index) => index > current && player.seen);
}
