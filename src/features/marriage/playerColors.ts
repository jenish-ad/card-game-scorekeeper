// Palette assignments are stored separately from seats so gaps and departures cannot renumber them.
export function nextPlayerColor(
  players: readonly { colorIndex?: number; active: boolean }[],
): number {
  const used = new Set(players.map((player) => player.colorIndex));
  const fresh = Array.from({ length: 6 }, (_, index) => index).find(
    (index) => !used.has(index),
  );
  if (fresh !== undefined) return fresh;
  const active = new Set(
    players
      .filter((player) => player.active)
      .map((player) => player.colorIndex),
  );
  const available = Array.from({ length: 6 }, (_, index) => index).find(
    (index) => !active.has(index),
  );
  if (available === undefined) throw new Error('No player color available');
  return available;
}
