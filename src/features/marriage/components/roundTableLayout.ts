// Keep names and totals visible while round columns scroll on smaller screens.
export function roundTableLayout(
  width: number,
  roundCount: number,
  fontScale: number,
) {
  const scale = Math.max(1, fontScale);
  const nameWidth = Math.ceil(80 * scale);
  const totalWidth = Math.ceil(56 * scale);
  const minimumRoundWidth = Math.ceil(44 * scale);
  const available = Math.max(0, width - nameWidth - totalWidth);
  const fits = width > 0 && available >= roundCount * minimumRoundWidth;
  return {
    nameWidth,
    totalWidth,
    roundWidth:
      fits && roundCount > 0 ? available / roundCount : minimumRoundWidth,
    fits,
  };
}
