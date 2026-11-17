import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Skeleton } from '@/components/Skeleton';
import { useDebounced } from '@/hooks/useDebounced';
import { useOnline } from '@/hooks/useOnline';
import { useStops, useTrip, useTripMutation } from '@/hooks/useTrips';
import { distanceToRoute, haversineKm } from '@/lib/geo';
import { fetchRoute, searchPlaces } from '@/lib/queries';
import { categoryIcon, STORIES, type Story } from '@/lib/stories';
import { routePoints } from '@/lib/tripRoute';
import { addStop, setTripOrigin, type NewStop } from '@/lib/trips';
import { Icon } from '@/components/Icon';
import { useColors } from '@/theme/useColors';
import { space } from '@/theme/tokens';

const ON_THE_WAY_KM = 15;
/** Places this close to the start are not a stop on the way, they are home. */
const SKIP_FROM_START_KM = 20;

/**
 * Search or pick a curated place. One tap adds it as a stop, or sets it as the
 * trip's start point when opened with purpose=origin. Curated places work offline.
 * The first stop becomes the destination; later ones slot in before it, in
 * route order when we know the route.
 */
export default function AddStopScreen() {
  const c = useColors();
  const router = useRouter();
  const online = useOnline();
  const { tripId, purpose } = useLocalSearchParams<{ tripId: string; purpose?: string }>();
  const forOrigin = purpose === 'origin';

  const trip = useTrip(tripId);
  const stopsQuery = useStops(tripId);
  const stops = useMemo(() => stopsQuery.data ?? [], [stopsQuery.data]);
  const points = useMemo(
    () => (trip.data ? routePoints(trip.data, stops) : []),
    [trip.data, stops],
  );
  const routeQuery = useQuery({
    queryKey: ['route', points.map((p) => `${p.lat},${p.lng}`).join('|')],
    queryFn: () => fetchRoute(points),
    enabled: !forOrigin && points.length >= 2,
  });
  const line = routeQuery.data?.geometry ?? null;
  const totalKm = (routeQuery.data?.distanceM ?? 0) / 1000;

  /**
   * Curated places near the route line, in driving order. Places around the
   * start point are left out: nobody wants a stop 4 km from home on a 230 km drive.
   */
  const onTheWay = useMemo(() => {
    if (!line || forOrigin) return [];
    const taken = new Set(stops.map((s) => s.storySlug));
    const start = trip.data?.origin ?? (points.length > 0 ? points[0] : null);
    return STORIES.filter((s) => !taken.has(s.slug))
      .filter((s) => !start || haversineKm(s, start) > SKIP_FROM_START_KM)
      .map((story) => ({ story, ...distanceToRoute(story, line) }))
      .filter((x) => x.km <= ON_THE_WAY_KM)
      .sort((a, b) => a.along - b.along);
  }, [line, stops, forOrigin, trip.data?.origin, points]);

  /** Where a new stop goes: before the destination, ordered along the route if we can. */
  const insertIndex = (story?: Story) => {
    if (stops.length === 0) return undefined;
    const intermediate = stops.slice(0, -1);
    if (!story || !line) return intermediate.length;
    const here = distanceToRoute(story, line).along;
    return intermediate.filter((s) => distanceToRoute(s, line).along < here).length;
  };
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const term = useDebounced(query.trim(), 450);
  const searching = term.length >= 2;

  const search = useQuery({
    queryKey: ['search', term.toLowerCase()],
    queryFn: () => searchPlaces(term),
    enabled: searching,
  });
  const save = useTripMutation(async ({ stop, at }: { stop: NewStop; at?: number }) => {
    if (forOrigin) await setTripOrigin(tripId, { name: stop.name, lat: stop.lat, lng: stop.lng });
    else await addStop(tripId, stop, at);
  });
  const pick = (stop: NewStop, story?: Story) =>
    save.mutate({ stop, at: insertIndex(story) }, { onSuccess: () => router.back() });

  const locateMe = async () => {
    setNote(null);
    setLocating(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setNote('Location is off. Search for your starting place instead.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = pos.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }).catch(
        () => [],
      );
      const name =
        [place?.name, place?.city ?? place?.subregion].filter(Boolean).join(', ') || 'My location';
      pick({ name, subtitle: '', lat, lng });
    } catch {
      setNote('Could not get your location just now.');
    } finally {
      setLocating(false);
    }
  };

  const lower = term.toLowerCase();
  const curated = searching ? STORIES.filter((s) => s.name.toLowerCase().includes(lower)) : STORIES;

  return (
    <Screen
      title={forOrigin ? 'Start point' : stops.length === 0 ? 'Where to?' : 'Add a stop'}
      onBack={() => router.back()}
    >
      {forOrigin ? (
        <View style={styles.sectionBottom}>
          <ListRow
            icon="locate"
            title={locating ? 'Finding you…' : 'Use my location'}
            subtitle="Asks for location once, only while the app is open"
            onPress={locating ? undefined : () => void locateMe()}
          />
          {note ? (
            <AppText variant="caption" tone="danger" accessibilityRole="alert">
              {note}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <SearchBar value={query} onChangeText={setQuery} />
      {!searching && onTheWay.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.headingRow}>
            <Icon name="car" size={18} color={c.clay} />
            <AppText variant="headline">On the way</AppText>
          </View>
          <AppText variant="caption" tone="muted">
            Curated places within {ON_THE_WAY_KM} km of your route
          </AppText>
          {onTheWay.map(({ story, km, along }) => (
            <ListRow
              key={story.slug}
              icon={categoryIcon[story.category]}
              title={story.name}
              subtitle={`${Math.round(along * totalKm)} km into the drive · ${km < 1 ? 'on the route' : `${Math.round(km)} km off route`}`}
              onPress={() =>
                pick(
                  {
                    name: story.name,
                    subtitle: story.region,
                    lat: story.lat,
                    lng: story.lng,
                    storySlug: story.slug,
                  },
                  story,
                )
              }
            />
          ))}
        </View>
      ) : null}
      {!searching && !forOrigin && stops.length >= 1 && points.length >= 2 ? (
        !line ? (
          <AppText variant="caption" tone="muted" style={styles.section}>
            {routeQuery.isPending
              ? 'Working out the route to suggest places on the way…'
              : 'Could not load the route, so on-the-way suggestions are off for now.'}
          </AppText>
        ) : onTheWay.length === 0 ? (
          <AppText variant="caption" tone="muted" style={styles.section}>
            None of our curated places sit along this route. Search for a town or landmark below, or
            pick from the popular places.
          </AppText>
        ) : null
      ) : null}
      <View style={styles.section}>
        {searching ? (
          search.isPending ? (
            <View style={styles.gap}>
              <Skeleton height={48} />
              <Skeleton height={48} />
            </View>
          ) : search.isError ? (
            <ErrorState
              title={online ? 'Search hit a bump' : 'You are offline'}
              message="You can still pick any of the curated places below."
              onRetry={() => void search.refetch()}
            />
          ) : search.data.length === 0 && curated.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nothing found"
              message="Try a town, park or landmark name."
            />
          ) : (
            search.data.map((r) => (
              <ListRow
                key={r.id}
                icon="pin"
                title={r.name}
                subtitle={r.subtitle}
                onPress={() => pick({ name: r.name, subtitle: r.subtitle, lat: r.lat, lng: r.lng })}
              />
            ))
          )
        ) : null}
      </View>
      {curated.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="title">{searching ? 'From Kenya Stories' : 'Popular places'}</AppText>
          {curated.map((s) => (
            <ListRow
              key={s.slug}
              icon={categoryIcon[s.category]}
              title={s.name}
              subtitle={s.region}
              onPress={() =>
                pick({
                  name: s.name,
                  subtitle: s.region,
                  lat: s.lat,
                  lng: s.lng,
                  storySlug: s.slug,
                })
              }
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: space.lg },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sectionBottom: { marginBottom: space.lg },
  gap: { gap: space.sm },
});
