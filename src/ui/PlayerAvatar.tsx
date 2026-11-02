import { Crown } from '@/ui/Crown';
import { View, Text } from 'react-native';
import { playerColor, devanagariFonts } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { playerInitials } from '@/ui/playerText';
import { t } from '@/i18n';
export function PlayerAvatar({
  name,
  colorIndex = 0,
  size = 36,
  leader = false,
  left = false,
}: {
  name: string;
  colorIndex?: number;
  size?: 24 | 28 | 36 | 44;
  leader?: boolean;
  left?: boolean;
}) {
  const theme = useTheme();
  const palette = playerColor(colorIndex, theme.dark);
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
            fontSize: Math.max(12, size * 0.42),
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
            top: -9,
            right: -8,
            backgroundColor: theme.colors.goldTint,
            borderRadius: 10,
            width: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Crown size={12} />
        </View>
      )}
    </View>
  );
}
