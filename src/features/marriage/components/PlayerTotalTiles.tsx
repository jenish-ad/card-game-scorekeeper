import { Text, View } from 'react-native';
import { n, t } from '@/i18n';
import { useTheme } from '@/theme/useTheme';
import { matchStandings } from '@/features/marriage/domain/standings';
import type { SavedMatch } from '@/features/marriage/data/matches';
import { moneyAmount } from '@/features/marriage/domain/settlement';
import { usePreferences } from '@/storage/PreferencesContext';

export function PlayerTotalTiles({ match }: { match: SavedMatch }) {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const { rows } = matchStandings(match);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {rows.map(({ player, total }) => {
        const backgroundColor =
          total > 0
            ? theme.colors.ink
            : total < 0
              ? theme.colors.lossTint
              : theme.colors.goldTint;
        const color =
          total > 0
            ? theme.colors.onInk
            : total < 0
              ? theme.colors.scoreLoss
              : theme.colors.goldText;
        const amount =
          match.settings.moneyRate === null
            ? total
            : moneyAmount(total, match.settings.moneyRate) / 100;
        const magnitude = Math.abs(amount);
        const score = `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${match.settings.moneyRate === null ? '' : `${t('Rs')}. `}${n(Number.isInteger(magnitude) ? magnitude : magnitude.toFixed(2))}`;
        return (
          <View
            key={player.id}
            accessible
            accessibilityLabel={`${player.name}, ${score}${!player.active ? `, ${t('Left')}` : ''}`}
            style={{
              flexGrow: 1,
              flexBasis: 64,
              minWidth: 64,
              padding: 10,
              borderRadius: 12,
              gap: 2,
              backgroundColor,
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color,
                fontFamily: theme.fonts.heavy,
                fontSize: preferences.numerals === 'devanagari' ? 21 : 18,
                height: 30,
                fontVariant: ['tabular-nums'],
              }}
            >
              {score}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color,
                fontFamily: theme.fonts.medium,
                fontSize: theme.type.caption + 1,
              }}
            >
              {player.name}
            </Text>
            {!player.active && (
              <Text
                style={{ color, fontFamily: theme.fonts.medium, fontSize: 10 }}
              >
                {t('Left')}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
