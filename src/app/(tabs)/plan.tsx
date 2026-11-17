import {
  Camera,
  Map as MapView,
  ViewAnnotation,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { IconButton } from '@/components/IconButton';
import { ListRow } from '@/components/ListRow';
import { MapPin } from '@/components/MapPin';
import { SearchBar } from '@/components/SearchBar';
import { SheetSurface } from '@/components/SheetSurface';
import { Skeleton } from '@/components/Skeleton';
import { useDebounced } from '@/hooks/useDebounced';
import { useOnline } from '@/hooks/useOnline';
import { useTripList } from '@/hooks/useTrips';
import { KENYA_CENTER, KENYA_ZOOM, MAP_STYLE_URL } from '@/lib/config';
import { toPlaceParams, type PlaceParams } from '@/lib/placeParams';
import { searchPlaces } from '@/lib/queries';
import { STORIES } from '@/lib/stories';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const SNAP_POINTS = [300, 520, 700];
const MIN_QUERY = 2;

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const online = useOnline();
  const camera = useRef<CameraRef>(null);

  const [query, setQuery] = useState('');
  const [sheetHeight, setSheetHeight] = useState(SNAP_POINTS[0]!);
  const [selected, setSelected] = useState<PlaceParams | null>(null);
  const [me, setMe] = useState<[number, number] | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  const term = useDebounced(query.trim(), 450);
  const searching = term.length >= MIN_QUERY;
  const search = useQuery({
    queryKey: ['search', term.toLowerCase()],
    queryFn: () => searchPlaces(term),
    enabled: searching,
  });
  const trips = useTripList();

  const focus = (place: PlaceParams) => {
    Keyboard.dismiss();
    setQuery('');
    setSelected(place);
    camera.current?.flyTo({ center: [place.lng, place.lat], zoom: 12, duration: 1200 });
  };

  const nearMe = async () => {
    setLocationNote(null);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setLocationNote('Location is off. You can still search for any place.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const here: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      setMe(here);
      camera.current?.flyTo({ center: here, zoom: 13, duration: 1200 });
    } catch {
      setLocationNote('Could not get your location just now.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.mapLand }]}>
      <MapView
        style={styles.root}
        mapStyle={MAP_STYLE_URL}
        contentInset={{ top: 0, left: 0, right: 0, bottom: sheetHeight }}
        logo={false}
        attribution
        attributionPosition={{ top: insets.top + 76, right: 12 }}
        onLongPress={(e) => {
          const [lng, lat] = e.nativeEvent.lngLat;
          focus({
            name: 'Dropped pin',
            subtitle: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat,
            lng,
          });
        }}
      >
        <Camera
          ref={camera}
          initialViewState={{ center: KENYA_CENTER, zoom: KENYA_ZOOM }}
          minZoom={4}
          maxZoom={17}
        />
        {STORIES.map((s) => (
          <ViewAnnotation
            key={s.slug}
            id={`story-${s.slug}`}
            lngLat={[s.lng, s.lat]}
            onPress={() =>
              focus({ name: s.name, subtitle: s.region, lat: s.lat, lng: s.lng, slug: s.slug })
            }
          >
            <View
              accessibilityLabel={`Story: ${s.name}`}
              style={[styles.storyDot, { backgroundColor: c.gold, borderColor: c.surface }]}
            />
          </ViewAnnotation>
        ))}
        {me ? (
          <ViewAnnotation id="me" lngLat={me}>
            <MapPin tone="me" />
          </ViewAnnotation>
        ) : null}
        {selected ? (
          <ViewAnnotation id="selected" lngLat={[selected.lng, selected.lat]}>
            <MapPin />
          </ViewAnnotation>
        ) : null}
      </MapView>

      <View style={[styles.search, { top: insets.top + space.md }]}>
        <View style={styles.searchBar}>
          <SearchBar value={query} onChangeText={setQuery} />
        </View>
        <IconButton
          raised
          icon="settings"
          label="Settings"
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={[styles.fab, { bottom: sheetHeight + space.lg }]}>
        <IconButton raised icon="locate" label="Show places near me" onPress={nearMe} />
      </View>

      <SheetSurface snapPoints={SNAP_POINTS} onVisibleHeight={setSheetHeight}>
        {searching ? (
          <>
            <AppText variant="headline">Results</AppText>
            {search.isPending ? (
              <View style={styles.skeletons}>
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
              </View>
            ) : search.isError ? (
              <ErrorState
                title={online ? 'Search hit a bump' : 'You are offline'}
                message={
                  online
                    ? 'We could not reach the search service. Try again in a moment.'
                    : 'Search needs a connection. Your saved trips still work.'
                }
                onRetry={() => void search.refetch()}
              />
            ) : search.data.length === 0 ? (
              <EmptyState
                icon="search"
                title="Nothing found"
                message="Try a town, park or landmark name, like Naivasha or Fort Jesus."
              />
            ) : (
              search.data.map((r) => (
                <ListRow
                  key={r.id}
                  icon="pin"
                  title={r.name}
                  subtitle={r.subtitle}
                  onPress={() =>
                    focus({ name: r.name, subtitle: r.subtitle, lat: r.lat, lng: r.lng })
                  }
                />
              ))
            )}
          </>
        ) : selected ? (
          <>
            <View style={styles.selectedHead}>
              <View style={styles.flex}>
                <AppText variant="display" tone="primary" numberOfLines={2}>
                  {selected.name}
                </AppText>
                <AppText variant="label" tone="muted" numberOfLines={1}>
                  {selected.subtitle}
                </AppText>
              </View>
              <IconButton icon="close" label="Clear selection" onPress={() => setSelected(null)} />
            </View>
            <View style={styles.actions}>
              <Button
                flex={1}
                label="Add to trip"
                icon="plus"
                onPress={() =>
                  router.push({ pathname: '/pick-trip', params: toPlaceParams(selected) })
                }
              />
              <Button
                flex={1}
                variant="outline"
                label="Details"
                onPress={() => router.push({ pathname: '/place', params: toPlaceParams(selected) })}
              />
            </View>
          </>
        ) : (
          <>
            <AppText variant="display" tone="primary">
              Karibu. Where to next?
            </AppText>
            <AppText variant="label" tone="muted" style={styles.sub}>
              Search a place, or press and hold the map to drop a pin.
            </AppText>
            {locationNote ? (
              <AppText variant="caption" tone="danger" style={styles.note}>
                {locationNote}
              </AppText>
            ) : null}
            <Button label="Plan a trip" icon="plus" onPress={() => router.push('/trip/new')} />
            {trips.data && trips.data.length > 0 ? (
              <View style={styles.recent}>
                <AppText variant="title">Your trips</AppText>
                {trips.data.slice(0, 3).map((t) => (
                  <ListRow
                    key={t.id}
                    icon="trips"
                    title={t.title}
                    subtitle={`${t.stopCount} ${t.stopCount === 1 ? 'stop' : 'stops'}${t.offlineAt ? ' · saved offline' : ''}`}
                    onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </SheetSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  search: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchBar: { flex: 1 },
  fab: { position: 'absolute', right: space.lg },
  storyDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  skeletons: { gap: space.sm, marginTop: space.md },
  selectedHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  sub: { marginTop: space.xs, marginBottom: space.lg },
  note: { marginBottom: space.md },
  recent: { marginTop: space.xl },
});
