import Svg, { G, Rect, Text as SvgText, Path } from 'react-native-svg';
import { useTheme } from '../useTheme';
export function KQMark({ size = 44 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" accessible={false}>
      <G transform="rotate(-14 30 40)">
        <Rect
          x="9"
          y="10"
          width="42"
          height="57"
          rx="8"
          fill={theme.colors.ink}
        />
        <SvgText
          x="18"
          y="35"
          fontSize="23"
          fontWeight="800"
          fill={theme.colors.onInk}
        >
          K
        </SvgText>
        <Path d="M28 45l7 7-7 7-7-7z" fill={theme.colors.onInk} />
      </G>
      <G transform="rotate(12 52 42)">
        <Rect
          x="32"
          y="16"
          width="40"
          height="55"
          rx="8"
          fill={theme.colors.gold}
        />
        <SvgText x="40" y="42" fontSize="23" fontWeight="800" fill="#17161B">
          Q
        </SvgText>
        <Path d="M46 52l4 4 4-4 4 4-8 8-8-8z" fill="#17161B" />
      </G>
    </Svg>
  );
}
