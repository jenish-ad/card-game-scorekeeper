import { defaultMatchTitle as title } from '../domain/matchTitle';
import { formatDate } from '@/i18n/dates';
export function defaultMatchTitle(date = new Date()) {
  return title(date, formatDate);
}
