import { Crown } from './Crown';
import { View, Text } from 'react-native';
import { playerColor, devanagariFonts } from '../theme';
import { useTheme } from '../useTheme';
import { playerInitials } from './playerText';
import { t } from '../i18n';
export function PlayerAvatar({
  name,
  seat = 0,
  size = 36,
  leader = false,
  left = false,
}: {
  name: string;
  seat?: number;
  size?: 24 | 28 | 36 | 44;
  leader?: boolean;
  left?: boolean;
}) {
  const theme = useTheme();
  const palette = playerColor(seat, theme.dark);
  return (
    <View
      accessible
      accessibilityLabel={`${name}${left ? `, ${t('Left')}` : ''}${leader ? `, ${t('Leader')}` : ''}`}
      style={{ width: size, height: size, opacity: left ? 0.4 : 1 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.tint,
        }}
      >
        <Text
          style={{
            color: palette.color,
            fontFamily: /[\u0900-\u097f]/.test(name)
              ? devanagariFonts.bold
              : theme.fonts.bold,
            fontSize: size * 0.36,
          }}
          numberOfLines={1}
        >
          {playerInitials(name) || '?'}
        </Text>
      </View>
      {leader && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            right: -5,
            backgroundColor: theme.colors.goldTint,
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Crown size={14} />
        </View>
      )}
    </View>
  );
}
