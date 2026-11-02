import Svg, { G, Rect, Path } from 'react-native-svg';
import { useTheme } from '../useTheme';
import { K_PATH, Q_PATH, DIAMOND_PATH, HEART_PATH } from './kqPaths';
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
        <Path d={K_PATH} fill={theme.colors.onInk} />
        <Path d={DIAMOND_PATH} fill={theme.colors.onInk} />
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
        <Path d={Q_PATH} fill="#17161B" />
        <Path d={HEART_PATH} fill="#17161B" />
      </G>
    </Svg>
  );
}
