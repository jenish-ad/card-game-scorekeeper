export function defaultMatchTitle(
  date: Date,
  format: (date: Date) => string,
): string {
  return format(date);
}
