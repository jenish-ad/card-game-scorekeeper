import { SceneLandscape } from '@/ui/SceneLandscape';
import { sceneHeader } from '@/ui/sceneHeader';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { t, n } from '@/i18n';
import { useTheme } from '@/theme/useTheme';
import { defaultSettings } from '@/features/marriage/domain/scoring';
import { Screen, useStyles } from '@/ui/Screen';

export default function RulesScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const c = theme.colors;
  const fees = [
    {
      label: t('Seen fee'),
      value: n(defaultSettings.seenFee),
      background: c.surface,
      color: c.text,
    },
    {
      label: t('Unseen fee'),
      value: n(defaultSettings.unseenFee),
      background: c.surface,
      color: c.text,
    },
    {
      label: t('Dublee'),
      value: `+${n(defaultSettings.dubleeExtra)}`,
      background: c.goldTint,
      color: c.goldText,
    },
    {
      label: t('Foul penalty'),
      value: n(defaultSettings.foulPenalty),
      background: c.lossTint,
      color: c.scoreLoss,
    },
  ];
  return (
    <Screen topSafeArea>
      <View style={[local.hero, { backgroundColor: c.sky }]}>
        <SceneLandscape />
        <Svg
          width={66}
          height={78}
          viewBox="260 30 76 90"
          style={{ position: 'absolute', right: 20, top: 20 }}
          accessible={false}
        >
          <Rect
            x="270"
            y="38"
            width="52"
            height="62"
            rx="8"
            fill={c.surface}
            stroke={c.ink}
            strokeWidth="1.5"
          />
          <Path
            d="M282 56 H310 M282 68 H310 M282 80 H300"
            stroke={c.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Circle cx="313" cy="94" r="12" fill="#E8AA18" />
          <Path
            d="M307 94 L311 98 L320 89"
            stroke="#FFFFFF"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.title, { color: c.text }]}>{t('Rules')}</Text>
      </View>
      <View
        style={[
          styles.card,
          {
            marginTop: -54,
            marginHorizontal: 10,
            backgroundColor: c.ink,
            gap: 10,
          },
        ]}
      >
        <Text
          style={{
            fontFamily: theme.fonts.heavy,
            fontSize: theme.type.h2,
            color: c.onInk,
            lineHeight: theme.type.h2 + 8,
          }}
        >
          {t('Total maal − (your maal × players) + fee')}
        </Text>
      </View>
      <View style={local.fees}>
        {fees.map((fee) => (
          <View
            key={fee.label}
            style={[local.fee, { backgroundColor: fee.background }]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.heavy,
                fontSize: theme.type.h2,
                color: fee.color,
              }}
            >
              {fee.value}
            </Text>
            <Text style={[styles.caption, { color: fee.color }]}>
              {fee.label}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const local = StyleSheet.create({
  hero: { ...sceneHeader, height: 150 },
  fees: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 10,
  },
  fee: {
    flexGrow: 1,
    flexBasis: 58,
    minWidth: 58,
    padding: 10,
    borderRadius: 16,
    gap: 4,
  },
});
