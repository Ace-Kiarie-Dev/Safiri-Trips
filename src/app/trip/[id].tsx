import { useQueries, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Skeleton } from '@/components/Skeleton';
import { StatPill } from '@/components/StatPill';
import { PackingTab } from '@/features/trip/PackingTab';
import { StopsTab } from '@/features/trip/StopsTab';
import { TripActions } from '@/features/trip/TripActions';
import { TripForm } from '@/features/trip/TripForm';
import { TripMap } from '@/features/trip/TripMap';
import { WeatherTab } from '@/features/trip/WeatherTab';
import { useOnline } from '@/hooks/useOnline';
import { useDeleteTrip, useStops, useTrip, useTripMutation } from '@/hooks/useTrips';
import { formatDay, formatDistance, formatDurationShort } from '@/lib/format';
import { generatePacking } from '@/lib/packing';
import { fetchRoute, fetchWeather } from '@/lib/queries';
import { shareTrip, tripAsText } from '@/lib/share';
import { getStory } from '@/lib/stories';
import { routePoints } from '@/lib/tripRoute';
import { updateTrip, type TripInput } from '@/lib/trips';
import { tripWindow } from '@/lib/tripWeather';
import { useSettings } from '@/state/settings';
import { space } from '@/theme/tokens';

const TABS = [
  { id: 'stops', label: 'Stops' },
  { id: 'weather', label: 'Weather' },
  { id: 'packing', label: 'Packing' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const online = useOnline();
  const units = useSettings((s) => s.units);
  const [tab, setTab] = useState<TabId>('stops');
  const [editing, setEditing] = useState(false);

  const trip = useTrip(id);
  const stopsQuery = useStops(id);
  const stops = useMemo(() => stopsQuery.data ?? [], [stopsQuery.data]);

  const points = useMemo(
    () => (trip.data ? routePoints(trip.data, stops) : []),
    [trip.data, stops],
  );
  const routeQuery = useQuery({
    queryKey: ['route', points.map((p) => `${p.lat},${p.lng}`).join('|')],
    queryFn: () => fetchRoute(points),
    enabled: points.length >= 2,
  });
  const route = points.length >= 2 ? (routeQuery.data ?? null) : null;

  const weather = useQueries({
    queries: stops.map((s) => ({
      queryKey: ['weather', s.lat.toFixed(2), s.lng.toFixed(2)],
      queryFn: () => fetchWeather(s.lat, s.lng),
    })),
  });

  const save = useTripMutation((input: TripInput) => updateTrip(id, input));
  const remove = useDeleteTrip();

  const data = trip.data;
  const forecasts = useMemo(
    () =>
      stops.flatMap((stop, i) => {
        const days = weather[i]?.data?.days;
        return days ? [{ stop, days }] : [];
      }),
    [stops, weather],
  );

  const packing = useMemo(() => {
    if (!data) return { labels: [] as string[], note: '', dates: new Set<string>() };
    const windows = forecasts.map((f) => tripWindow(f.days, data.startDate, data.days));
    const exact = windows.length > 0 && windows.every((w) => w.exact);
    const categories = stops.flatMap((s) => {
      const story = getStory(s.storySlug);
      return story ? [story.category] : [];
    });
    return {
      labels:
        stops.length === 0
          ? []
          : generatePacking({
              days: data.days,
              forecast: windows.flatMap((w) => w.days),
              categories,
            }),
      note:
        forecasts.length === 0
          ? 'A starter list. It sharpens up once the forecast loads.'
          : exact
            ? 'Built from the forecast for your trip dates.'
            : 'Built from the next 7 days. Set a start date within a week for an exact list.',
      dates: new Set(exact ? windows.flatMap((w) => w.days.map((d) => d.date)) : []),
    };
  }, [data, forecasts, stops]);

  if (trip.isPending || stopsQuery.isPending) {
    return (
      <Screen title="Trip" onBack={() => router.back()}>
        <View style={styles.gap}>
          <Skeleton height={220} radius={24} />
          <Skeleton height={48} />
          <Skeleton height={160} />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen title="Trip" onBack={() => router.back()}>
        <EmptyState
          icon="trips"
          title="Trip not found"
          message="This trip may have been deleted."
          actionLabel="Back to trips"
          onAction={() => router.replace('/trips')}
        />
      </Screen>
    );
  }

  if (editing) {
    return (
      <Screen title="Edit trip" onBack={() => setEditing(false)}>
        <TripForm
          initial={{ title: data.title, startDate: data.startDate, days: data.days }}
          submitLabel="Save changes"
          onSubmit={(input) => save.mutate(input, { onSuccess: () => setEditing(false) })}
        />
      </Screen>
    );
  }

  const confirmDelete = () =>
    Alert.alert('Delete this trip?', 'Its stops, packing list, alerts and offline copy go too.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(id, { onSuccess: () => router.replace('/trips') }),
      },
    ]);

  const routeNote =
    points.length < 2
      ? null
      : routeQuery.isPending
        ? 'Working out the drive…'
        : routeQuery.isError
          ? online
            ? 'Could not load the road route, so the map shows straight lines for now.'
            : 'You are offline and this route is not saved yet. The map shows straight lines.'
          : null;

  return (
    <Screen
      title={data.title}
      onBack={() => router.back()}
      right={
        <>
          <IconButton
            icon="share"
            label="Share trip"
            disabled={stops.length === 0}
            onPress={() => void shareTrip(tripAsText(data, stops, route, units))}
          />
          <IconButton icon="settings" label="Edit trip" onPress={() => setEditing(true)} />
          <IconButton icon="trash" label="Delete trip" onPress={confirmDelete} />
        </>
      }
    >
      <TripMap trip={data} stops={stops} route={route} />
      <View style={styles.summary}>
        <StatPill
          icon="car"
          value={route ? formatDistance(route.distanceM, units) : '—'}
          label="Distance"
        />
        <StatPill
          icon="clock"
          value={route ? formatDurationShort(route.durationS) : '—'}
          label="Drive time"
        />
        <StatPill
          icon="trips"
          value={`${data.days} ${data.days === 1 ? 'day' : 'days'}`}
          label={data.startDate ? formatDay(data.startDate) : 'No dates yet'}
        />
        <StatPill
          icon="pin"
          value={`${stops.length} ${stops.length === 1 ? 'stop' : 'stops'}`}
          label={data.offlineAt ? 'Saved offline' : 'Places'}
        />
      </View>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      <View style={styles.tab}>
        {tab === 'stops' ? (
          <StopsTab trip={data} stops={stops} route={route} routeNote={routeNote} />
        ) : tab === 'weather' ? (
          <WeatherTab stops={stops} weather={weather} tripDates={packing.dates} />
        ) : (
          <PackingTab tripId={id} suggested={packing.labels} note={packing.note} />
        )}
      </View>
      {tab === 'stops' ? (
        <TripActions
          trip={data}
          stops={stops}
          route={route}
          forecasts={forecasts}
          online={online}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: space.md },
  flex: { flex: 1 },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm + 2,
    marginVertical: space.md,
  },
  tab: { marginTop: space.lg },
});
