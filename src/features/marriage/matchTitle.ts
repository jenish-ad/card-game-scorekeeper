import { formatDate } from '../../i18n/dates';
export function defaultMatchTitle(date = new Date()): string {
  return formatDate(date);
}
