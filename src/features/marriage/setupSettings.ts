import { latinDigits } from '../../i18n/numbers';
import { parseSettings, type MatchSettings } from './scoring';
export function parseSetupSettings(
  fees: {
    seenFee: string;
    unseenFee: string;
    dubleeExtra: string;
    foulPenalty: string;
  },
  foulMode: MatchSettings['foulMode'],
  moneyEnabled: boolean,
  moneyRate: string,
): MatchSettings {
  const whole = (value: string) =>
    /^\d+$/.test(latinDigits(value)) ? Number(latinDigits(value)) : NaN;
  return parseSettings({
    seenFee: whole(fees.seenFee),
    unseenFee: whole(fees.unseenFee),
    dubleeExtra: whole(fees.dubleeExtra),
    foulPenalty: whole(fees.foulPenalty),
    foulMode,
    moneyRate: moneyEnabled ? Number(latinDigits(moneyRate)) : null,
  });
}
