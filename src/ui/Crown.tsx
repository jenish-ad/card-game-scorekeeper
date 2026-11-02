import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../useTheme';
export function Crown({
  selected = true,
  size = 20,
}: {
  selected?: boolean;
  size?: number;
}) {
  const theme = useTheme();
  const color = selected ? theme.colors.goldText : theme.colors.mutedText;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M3 6l5 4 4-7 4 7 5-4-3 12H6L3 6zm4 15h10"
        fill={selected ? color : 'none'}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
