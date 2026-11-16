import type { UseQueryResult } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Icon } from '@/components/Icon';
import { Skeleton } from '@/components/Skeleton';
import { clockTime, formatTemp, weekday } from '@/lib/format';
import type { ForecastDay, WeatherData } from '@/lib/schemas';
import type { Stop } from '@/lib/trips';
import { describeAqi, describeWeather } from '@/lib/weatherCode';
import { useSettings } from '@/state/settings';
import { radius, shadow, space } from '@/theme/tokens';
import { useColors, type ColorTokens } from '@/theme/useColors';

type Props = { stops: Stop[]; weather: UseQueryResult<WeatherData>[]; tripDates: Set<string> };

const BAR_MAX = 40;

function advice(d: ForecastDay): string {
  const w = describeWeather(d.code).label;
  if (d.rainPct >= 60) return `${w}. Pack a jacket.`;
  if (d.uv >= 8) return `${w}, very high UV.`;
  if (d.maxC >= 30) return `${w} and hot.`;
  if (d.minC <= 10) return `${w}, cold start.`;
  return w;
}

const wet = (d: ForecastDay) => d.rainPct >= 50 || describeWeather(d.code).icon === 'rain';

function aqiTint(aqi: number, c: ColorTokens) {
  return aqi <= 50 ? c.primarySoft : aqi <= 100 ? c.sunSoft : c.surfaceAlt;
}

export function WeatherTab({ stops, weather, tripDates }: Props) {
  const c = useColors();
  const units = useSettings((s) => s.units);

  if (stops.length === 0) {
    return (
      <EmptyState
        icon="sun"
        title="Weather needs a stop"
        message="Add a stop and its 7 day forecast shows up here."
      />
    );
  }

  return (
    <View style={styles.list}>
      {stops.map((s, i) => {
        const q = weather[i];
        if (!q || q.isPending) {
          return <Skeleton key={s.id} height={260} radius={radius.lg} />;
        }
        if (q.isError) {
          return (
            <ErrorState
              key={s.id}
              title={`No forecast for ${s.name}`}
              message="We could not load the weather and nothing is saved for this stop."
              onRetry={() => void q.refetch()}
            />
          );
        }
        const days = q.data.days;
        const hero = days.find((d) => tripDates.has(d.date)) ?? days[0];
        if (!hero) return null;
        const heroWeather = describeWeather(hero.code);
        const heroWet = wet(hero);
        return (
          <View key={s.id} style={[styles.card, { backgroundColor: c.surface }]}>
            <View style={[styles.hero, { backgroundColor: heroWet ? c.skySoft : c.sunSoft }]}>
              <View style={styles.heroText}>
                <AppText variant="label" tone="muted" numberOfLines={1}>
                  {s.name} · {weekday(hero.date)}
                </AppText>
                <AppText style={styles.temp}>{formatTemp(hero.maxC, units)}</AppText>
                <AppText variant="title">{advice(hero)}</AppText>
                <AppText variant="caption" tone="muted">
                  Low {formatTemp(hero.minC, units)} · {hero.rainPct}% chance of rain
                </AppText>
              </View>
              <Icon name={heroWeather.icon} size={56} color={heroWet ? c.sky : c.gold} />
            </View>

            <View style={styles.strip}>
              {days.map((d) => {
                const w = describeWeather(d.code);
                const inTrip = tripDates.has(d.date);
                return (
                  <View
                    key={d.date}
                    accessible
                    accessibilityLabel={`${weekday(d.date)}, ${w.label}, high ${formatTemp(d.maxC, units)}, low ${formatTemp(d.minC, units)}, ${d.rainPct}% chance of rain`}
                    style={[styles.day, inTrip && { backgroundColor: c.primarySoft }]}
                  >
                    <AppText variant="micro" tone="muted">
                      {weekday(d.date)}
                    </AppText>
                    <Icon
                      name={w.icon}
                      size={20}
                      color={
                        w.icon === 'rain' || w.icon === 'storm'
                          ? c.sky
                          : w.icon === 'sun'
                            ? c.gold
                            : c.muted
                      }
                    />
                    <AppText variant="label">{Math.round(d.maxC)}°</AppText>
                    <AppText variant="micro" tone="muted">
                      {Math.round(d.minC)}°
                    </AppText>
                    <View style={[styles.barTrack, { backgroundColor: c.skySoft }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: Math.round((d.rainPct / 100) * BAR_MAX),
                            backgroundColor: c.sky,
                          },
                        ]}
                      />
                    </View>
                    <AppText variant="micro" style={{ color: c.sky }}>
                      {d.rainPct}%
                    </AppText>
                  </View>
                );
              })}
            </View>

            <View style={styles.chips}>
              {q.data.aqi !== null ? (
                <View style={[styles.chip, { backgroundColor: aqiTint(q.data.aqi, c) }]}>
                  <Icon name="wind" size={14} color={c.ink} />
                  <AppText variant="micro">
                    Air {q.data.aqi} · {describeAqi(q.data.aqi)}
                  </AppText>
                </View>
              ) : null}
              <View style={[styles.chip, { backgroundColor: c.sunSoft }]}>
                <Icon name="sunrise" size={14} color={c.ink} />
                <AppText variant="micro">
                  {clockTime(hero.sunrise)} · {clockTime(hero.sunset)}
                </AppText>
              </View>
            </View>
          </View>
        );
      })}
      <AppText variant="micro" tone="muted">
        Shaded days fall inside your trip. Bars show the chance of rain. Weather by Open-Meteo.com.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.lg },
  card: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  heroText: { flex: 1, gap: 2 },
  temp: { fontFamily: 'Fraunces_700Bold', fontSize: 44, lineHeight: 48 },
  strip: { flexDirection: 'row', paddingHorizontal: space.xs, paddingTop: space.sm },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
  },
  barTrack: {
    width: 16,
    height: BAR_MAX,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: space.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
});
