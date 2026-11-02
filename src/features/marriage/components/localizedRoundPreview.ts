import {
  roundPreview as preview,
  foulPreview as foul,
} from '../domain/roundPreview';
import { translateError } from '@/i18n';
export function localizedRoundPreview(...args: Parameters<typeof preview>) {
  const result = preview(...args);
  return result.ok
    ? result
    : {
        ...result,
        message: translateError(result.error, 'Check the round inputs.'),
      };
}
export function localizedFoulPreview(...args: Parameters<typeof foul>) {
  const result = foul(...args);
  return result.ok
    ? result
    : {
        ...result,
        message: translateError(result.error, 'Check the round inputs.'),
      };
}
