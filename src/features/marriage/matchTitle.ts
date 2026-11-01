export function defaultMatchTitle(date = new Date()): string {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const day = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  return `${weekday}, ${day}`;
}
