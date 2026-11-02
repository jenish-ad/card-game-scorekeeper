import { SceneLandscape } from '@/ui/SceneLandscape';
import { Card } from '@/ui/Card';
import { sceneHeader } from '@/ui/sceneHeader';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { UnavailableMatchCard } from '@/features/marriage/components/UnavailableMatchCard';
import { t, n } from '@/i18n';
import { useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import { useMatches } from '@/features/marriage/data/useMatches';
import type { SavedMatch } from '@/features/marriage/data/matches';
import { MatchCard } from '@/features/marriage/components/MatchCard';
import { Button } from '@/ui/Button';
import { KQMark } from '@/ui/KQMark';
import { useTheme } from '@/theme/useTheme';
import { usePreferences } from '@/storage/PreferencesContext';
import { adToBs } from '@/i18n/calendar/bikramSambat';
import type { TranslationKey } from '@/i18n/locales/en';
import { Screen, useStyles } from '@/ui/Screen';

export default function HistoryScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { preferences } = usePreferences();
  const { matches, unavailable, loading, error, reload } = useMatches();
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('all');
  const activeCount = matches.filter((match) => !match.finishedAt).length;
  const filtered = matches.filter(
    (match) =>
      filter === 'all' || Boolean(match.finishedAt) === (filter === 'finished'),
  );
  const groups = new Map<string, { title: string; matches: SavedMatch[] }>();
  for (const match of [...filtered].sort(
    (a, b) =>
      Date.parse(b.finishedAt ?? b.createdAt) -
      Date.parse(a.finishedAt ?? a.createdAt),
  )) {
    const date = new Date(match.finishedAt ?? match.createdAt);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let calendar = 'ad';
    if (preferences.calendar === 'bs') {
      try {
        const bs = adToBs(year, month, date.getDate());
        year = bs.year;
        month = bs.month;
        calendar = 'bs';
      } catch {
        /* Keep AD for dates outside the supported BS range. */
      }
    }
    const key = `${calendar}-${year}-${month}`;
    const monthName =
      calendar === 'bs'
        ? t(`bsMonth${month}` as TranslationKey)
        : preferences.language === 'ne'
          ? t(`adMonth${month}` as TranslationKey)
          : date.toLocaleDateString('en-GB', { month: 'long' });
    const group = groups.get(key) ?? {
      title: `${monthName} ${n(year)}`,
      matches: [],
    };
    group.matches.push(match);
    groups.set(key, group);
  }
  return (
    <Screen topSafeArea>
      <View
        style={{
          ...sceneHeader,
          height: 150,
          backgroundColor: theme.colors.sky,
        }}
      >
        <SceneLandscape />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 360 165"
          preserveAspectRatio="xMidYMax slice"
          style={StyleSheet.absoluteFill}
          accessible={false}
        ></Svg>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('History')}
        </Text>
        <View style={{ position: 'absolute', right: 16, top: 35 }}>
          <KQMark size={70} />
        </View>
      </View>
      <SegmentedControl
        filled
        label={t('History')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('All') },
          { value: 'active', label: `${t('Active')} ${n(activeCount)}` },
          {
            value: 'finished',
            label: `${t('Finished')} ${n(matches.length - activeCount)}`,
          },
        ]}
      />
      {loading ? (
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label={t('Try again')} onPress={reload} />
        </>
      ) : filtered.length ? (
        [...groups.entries()].map(([key, group]) => (
          <View key={key} style={{ gap: 8 }}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.ink, paddingHorizontal: 4 },
              ]}
            >
              {group.title}
            </Text>
            <Card style={{ gap: 0 }}>
              {group.matches.map((match, index) => (
                <View key={match.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <MatchCard match={match} grouped compact reload={reload} />
                </View>
              ))}
            </Card>
          </View>
        ))
      ) : unavailable.length ? null : (
        <Text style={styles.body}>
          {filter === 'all'
            ? t('No matches yet.')
            : filter === 'active'
              ? t('No active matches yet.')
              : t('No finished matches yet.')}
        </Text>
      )}
      {unavailable.map((entry) => (
        <UnavailableMatchCard key={entry.id} />
      ))}
    </Screen>
  );
}
