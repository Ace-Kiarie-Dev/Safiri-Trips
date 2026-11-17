import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FindingCard } from '@/components/FindingCard';
import { ErrorState } from '@/components/ErrorState';
import { ListRow } from '@/components/ListRow';
import { PlaceRow } from '@/components/PlaceRow';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Skeleton } from '@/components/Skeleton';
import { useDebounced } from '@/hooks/useDebounced';
import { useOnline } from '@/hooks/useOnline';
import { useStops, useTrip, useTripMutation } from '@/hooks/useTrips';
import { distanceToRoute, haversineKm, sampleAlong } from '@/lib/geo';
import { fetchAlong, fetchRoute, searchPlaces } from '@/lib/queries';
import { categoryIcon, STORIES, type Story } from '@/lib/stories';
import { WAYPOINTS, waypointLabel, type Waypoint } from '@/lib/waypoints';
import { routePoints } from '@/lib/tripRoute';
import { addStop, setTripOrigin, type NewStop } from '@/lib/trips';
import { Icon } from '@/components/Icon';
import { useColors } from '@/theme/useColors';
import { space } from '@/theme/tokens';

const ON_THE_WAY_KM = 15;
/** Our own places get a little more slack than Wikipedia's. */
const CURATED_KM = 20;
const MAX_SUGGESTIONS = 12;
/** The first stretch of a drive is home turf, not a stop. Whichever is larger applies. */
const SKIP_START_KM = 30;
const SKIP_START_FRACTION = 0.12;
const SKIP_END_KM = 5;
const SAMPLE_EVERY_KM = 15;
const MAX_SAMPLES = 16;

type Suggestion = {
  key: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  km: number;
  along: number;
  story?: Story;
  waypoint?: Waypoint;
  imageUrl?: string | null;
};

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
  // When the road route cannot be loaded, fall back to straight lines between the
  // stops. Suggestions still work, with rougher distances and a wider corridor.
  const approximate = !routeQuery.data && routeQuery.isError && points.length >= 2;
  const line = useMemo<[number, number][] | null>(
    () =>
      routeQuery.data?.geometry ??
      (approximate ? points.map((p) => [p.lng, p.lat] as [number, number]) : null),
    [routeQuery.data, approximate, points],
  );
  const totalKm = routeQuery.data
    ? routeQuery.data.distanceM / 1000
    : approximate
      ? points.slice(1).reduce((sum, p, i) => sum + haversineKm(points[i]!, p), 0)
      : 0;
  const destinationName = stops[stops.length - 1]?.name ?? 'your destination';
  const skipStartKm = Math.max(SKIP_START_KM, totalKm * SKIP_START_FRACTION);
  const minAlong = totalKm > 0 ? skipStartKm / totalKm : 0;
  const maxAlong = totalKm > 0 ? 1 - SKIP_END_KM / totalKm : 1;

  const samples = useMemo(
    () => (line ? sampleAlong(line, SAMPLE_EVERY_KM, skipStartKm, SKIP_END_KM, MAX_SAMPLES) : []),
    [line, skipStartKm],
  );
  const alongQuery = useQuery({
    queryKey: ['along', samples.map((p) => `${p.lat.toFixed(2)},${p.lng.toFixed(2)}`).join('|')],
    queryFn: () => fetchAlong(samples),
    enabled: !forOrigin && samples.length > 0,
  });

  /**
   * Places along the route in driving order: our curated stories when they are
   * in the corridor, plus notable places Wikipedia knows about. The first
   * stretch of the drive and the destination's own area are left out.
   */
  const onTheWay = useMemo<Suggestion[]>(() => {
    if (!line || forOrigin) return [];
    const taken = new Set(stops.map((s) => s.storySlug));
    const takenNames = new Set(stops.map((s) => s.name.toLowerCase()));
    const slack = approximate ? 2 : 1;
    const inWindow = (x: { km: number; along: number }, maxKm = ON_THE_WAY_KM) =>
      x.km <= maxKm * slack && x.along >= minAlong && x.along <= maxAlong;

    const curated: Suggestion[] = STORIES.filter((s) => !taken.has(s.slug))
      .map((story) => ({ story, ...distanceToRoute(story, line) }))
      .filter((x) => inWindow(x, CURATED_KM))
      .map(({ story, km, along }) => ({
        key: story.slug,
        name: story.name,
        subtitle: story.region,
        lat: story.lat,
        lng: story.lng,
        km,
        along,
        story,
      }));
    const curatedNames = new Set(curated.map((c) => c.name.toLowerCase()));

    const roadside: Suggestion[] = WAYPOINTS.filter(
      (w) => !taken.has(w.slug) && !curatedNames.has(w.name.toLowerCase()),
    )
      .map((waypoint) => ({ waypoint, ...distanceToRoute(waypoint, line) }))
      .filter((x) => inWindow(x, CURATED_KM))
      .map(({ waypoint, km, along }) => ({
        key: waypoint.slug,
        name: waypoint.name,
        subtitle: `${waypointLabel[waypoint.kind]} · ${waypoint.blurb}`,
        lat: waypoint.lat,
        lng: waypoint.lng,
        km,
        along,
        waypoint,
      }));
    for (const r of roadside) curatedNames.add(r.name.toLowerCase());

    const found: Suggestion[] = (alongQuery.data ?? [])
      .filter(
        (p) => !takenNames.has(p.name.toLowerCase()) && !curatedNames.has(p.name.toLowerCase()),
      )
      .map((p) => ({ p, ...distanceToRoute(p, line) }))
      .filter(inWindow)
      .map(({ p, km, along }) => ({
        key: p.id,
        name: p.name,
        subtitle: p.description || 'Notable place',
        lat: p.lat,
        lng: p.lng,
        km,
        along,
        imageUrl: p.imageUrl,
      }));

    return [...curated, ...roadside, ...found]
      .sort((a, b) => a.along - b.along)
      .slice(0, MAX_SUGGESTIONS);
  }, [line, stops, forOrigin, alongQuery.data, minAlong, maxAlong, approximate]);

  /** Where a new stop goes: before the destination, ordered along the route if we can. */
  const insertIndex = (place?: { lat: number; lng: number }) => {
    if (stops.length === 0) return undefined;
    const intermediate = stops.slice(0, -1);
    if (!place || !line) return intermediate.length;
    const here = distanceToRoute(place, line).along;
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
  const pick = (stop: NewStop, place?: { lat: number; lng: number }) =>
    save.mutate({ stop, at: insertIndex(place) }, { onSuccess: () => router.back() });

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
      {!searching && !forOrigin && stops.length >= 1 && points.length >= 2 && !line ? (
        <View style={styles.section}>
          <FindingCard
            title={`Finding stops on the way to ${destinationName}`}
            message="Working out your road first. This takes a few seconds."
          />
        </View>
      ) : null}
      {!searching && line && onTheWay.length === 0 && alongQuery.isPending ? (
        <View style={styles.section}>
          <FindingCard
            title={`Finding stops on the way to ${destinationName}`}
            message={`Checking ${Math.round(totalKm)} km of road for places worth a stop.`}
          />
        </View>
      ) : null}
      {!searching && onTheWay.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.headingRow}>
            <Icon name="car" size={18} color={c.clay} />
            <AppText variant="headline">On the way to {destinationName}</AppText>
          </View>
          <AppText variant="caption" tone="muted">
            {approximate
              ? 'The road route did not load, so these follow a straight line and distances are rough.'
              : 'Places near the road, in driving order'}
          </AppText>
          {approximate ? (
            <View style={styles.retry}>
              <Button
                label="Try loading the road again"
                variant="outline"
                onPress={() => void routeQuery.refetch()}
              />
            </View>
          ) : null}
          {onTheWay.map((s) => (
            <PlaceRow
              key={s.key}
              slug={s.story?.slug}
              category={s.story?.category}
              imageUrl={s.imageUrl}
              title={s.name}
              subtitle={`${approximate ? 'About ' : ''}${Math.round(s.along * totalKm)} km in${s.km < 1.5 || approximate ? '' : ` · ${Math.round(s.km)} km off the road`} · ${s.subtitle}`}
              onPress={() =>
                pick(
                  {
                    name: s.name,
                    subtitle: s.subtitle.slice(0, 120),
                    lat: s.lat,
                    lng: s.lng,
                    storySlug: s.story?.slug ?? s.waypoint?.slug ?? null,
                  },
                  s,
                )
              }
            />
          ))}
          {alongQuery.isPending ? (
            <View style={styles.more}>
              <ActivityIndicator color={c.accent} />
              <AppText variant="label" tone="muted">
                Looking for more places along the road…
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
      {!searching && !forOrigin && stops.length >= 1 && points.length >= 2 ? (
        line && onTheWay.length === 0 && !alongQuery.isPending ? (
          <AppText variant="caption" tone="muted" style={styles.section}>
            Nothing notable found along this road. Search for a town or landmark below, or pick from
            the popular places.
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
          <AppText variant="title">
            {searching
              ? 'From Kenya Stories'
              : stops.length > 0
                ? 'Anywhere in Kenya'
                : 'Popular places'}
          </AppText>
          {!searching && stops.length > 0 ? (
            <AppText variant="caption" tone="muted">
              Our full list, not just your route
            </AppText>
          ) : null}
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
  retry: { marginTop: space.sm },
  more: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  sectionBottom: { marginBottom: space.lg },
  gap: { gap: space.sm },
});
