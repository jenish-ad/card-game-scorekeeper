// Width is the measured table container, after the screen's horizontal padding.
export function roundTableLayout(
  width: number,
  playerCount: number,
  fontScale: number,
) {
  const roundWidth = 40;
  const minimumPlayerWidth = 52 * fontScale;
  const available = Math.max(0, width - roundWidth - 2);
  return {
    roundWidth,
    minimumPlayerWidth,
    fits: available >= playerCount * minimumPlayerWidth,
  };
}
