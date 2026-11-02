import { SceneLandscape } from '@/ui/SceneLandscape';
import { sceneHeader } from '@/ui/sceneHeader';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';
import { t } from '@/i18n';
import { KQMark } from '@/ui/KQMark';

export function HomeHero() {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={[local.hero, { backgroundColor: c.sky }]}>
      <SceneLandscape />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 230"
        preserveAspectRatio="xMidYMax slice"
        style={StyleSheet.absoluteFill}
        accessible={false}
      >
        <Circle cx="294" cy="66" r="25" fill={c.sun} />
        <Rect x="60" y="131" width="55" height="43" rx="2" fill="#FFF3BD" />
        <Path d="M47 133 L87 105 L127 133Z" fill="#B95036" />
        <Rect x="91" y="148" width="13" height="26" fill="#A87546" />
        <Rect x="71" y="144" width="12" height="12" fill="#E8B22D" />
        <Circle cx="159" cy="165" r="14" fill={c.hillFront} />
        <Circle cx="175" cy="159" r="12" fill={c.hillFront} />
        <Path
          d="M20 103 Q123 139 245 99"
          fill="none"
          stroke={c.ink}
          strokeWidth="1"
          opacity="0.5"
        />
        {[34, 64, 94, 124, 154, 184, 214, 240].map((x, i) => (
          <Circle
            key={x}
            cx={x}
            cy={106 + Math.sin(i / 2) * 16 - i}
            r="3.5"
            fill={i % 2 ? '#E75D48' : '#E9B82D'}
          />
        ))}
        <Line
          x1="87"
          y1="105"
          x2="87"
          y2="91"
          stroke="#A87546"
          strokeWidth="2"
        />
        <Path d="M88 91 L101 96 L88 100Z" fill="#E75D48" />
      </Svg>
      <View style={local.heading}>
        <Text
          style={{ color: c.text, fontFamily: theme.fonts.heavy, fontSize: 28 }}
        >
          {t('Marriage')}
        </Text>
      </View>
      <View style={local.cards}>
        <KQMark size={76} />
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  hero: sceneHeader,
  heading: {
    padding: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cards: {
    position: 'absolute',
    right: 18,
    bottom: 64,
    transform: [{ rotate: '8deg' }],
  },
});
