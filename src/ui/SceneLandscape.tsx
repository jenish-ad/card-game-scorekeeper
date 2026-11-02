import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';

export function SceneLandscape() {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessible={false}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 190"
        preserveAspectRatio="none"
        accessible={false}
      >
        <Path
          d="M0 115 Q90 79 185 94 T360 89 V190 H0Z"
          fill={colors.hillBack}
        />
        <Path
          d="M0 137 Q100 110 205 125 T360 120 V190 H0Z"
          fill={colors.hillMid}
        />
        <Path
          d="M0 159 Q100 142 205 150 T360 146 V190 H0Z"
          fill={colors.hillFront}
        />
      </Svg>
    </View>
  );
}
