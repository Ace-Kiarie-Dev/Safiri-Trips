import type { UseQueryResult } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Icon } from '@/components/Icon';
import { Skeleton } from '@/components/Skeleton';
import { clockTime, formatTemp, weekday } from '@/lib/format';
import type { WeatherData } from '@/lib/schemas';
import type { Stop } from '@/lib/trips';
import { describeAqi, describeWeather } from '@/lib/weatherCode';
import { useSettings } from '@/state/settings';
import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = { stops: Stop[]; weather: UseQueryResult<WeatherData>[]; tripDates: Set<string> };

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
        const today = q?.data?.days[0];
        return (
          <View key={s.id} style={[styles.card, { backgroundColor: c.surface }]}>
            <AppText variant="title" numberOfLines={1}>
              {s.name}
            </AppText>
            {!q || q.isPending ? (
              <Skeleton height={96} style={styles.block} />
            ) : q.isError ? (
              <View style={styles.block}>
                <ErrorState
                  title="No forecast yet"
                  message="We could not load the weather and nothing is saved for this stop."
                  onRetry={() => void q.refetch()}
                />
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.strip}
                >
                  {q.data.days.map((d) => {
                    const w = describeWeather(d.code);
                    const inTrip = tripDates.has(d.date);
                    return (
                      <View
                        key={d.date}
                        accessible
                        accessibilityLabel={`${weekday(d.date)}, ${w.label}, high ${formatTemp(d.maxC, units)}, low ${formatTemp(d.minC, units)}, ${d.rainPct}% chance of rain`}
                        style={[
                          styles.day,
                          {
                            backgroundColor: inTrip ? c.indicator : 'transparent',
                            borderColor: c.line,
                          },
                        ]}
                      >
                        <AppText variant="micro" tone="muted">
                          {weekday(d.date)}
                        </AppText>
                        <Icon name={w.icon} size={22} color={c.primary} />
                        <AppText variant="label">{formatTemp(d.maxC, units)}</AppText>
                        <AppText variant="caption" tone="muted">
                          {formatTemp(d.minC, units)}
                        </AppText>
                        <AppText variant="micro" tone="muted">
                          {d.rainPct}%
                        </AppText>
                      </View>
                    );
                  })}
                </ScrollView>
                <AppText variant="caption" tone="muted">
                  {today
                    ? `Sunrise ${clockTime(today.sunrise)} · Sunset ${clockTime(today.sunset)}`
                    : ''}
                  {q.data.aqi !== null
                    ? ` · Air quality ${q.data.aqi} (${describeAqi(q.data.aqi)})`
                    : ''}
                </AppText>
              </>
            )}
          </View>
        );
      })}
      <AppText variant="micro" tone="muted">
        Shaded days fall inside your trip. Rain shown as chance per day. Weather data by
        Open-Meteo.com.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  card: { borderRadius: radius.md, padding: space.lg, gap: space.sm },
  block: { marginTop: space.sm },
  strip: { gap: space.sm, paddingVertical: space.xs },
  day: {
    width: 60,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
