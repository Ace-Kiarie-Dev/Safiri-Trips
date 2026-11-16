import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useTripMutation } from '@/hooks/useTrips';
import { searchPlaces } from '@/lib/queries';
import { categoryIcon, STORIES } from '@/lib/stories';
import { addStop, type NewStop } from '@/lib/trips';
import { space } from '@/theme/tokens';

/** Search or pick a curated place, one tap adds it to the trip. Works offline with the curated list. */
export default function AddStopScreen() {
  const router = useRouter();
  const online = useOnline();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [query, setQuery] = useState('');
  const term = useDebounced(query.trim(), 450);
  const searching = term.length >= 2;

  const search = useQuery({
    queryKey: ['search', term.toLowerCase()],
    queryFn: () => searchPlaces(term),
    enabled: searching,
  });
  const add = useTripMutation((stop: NewStop) => addStop(tripId, stop));
  const pick = (stop: NewStop) => add.mutate(stop, { onSuccess: () => router.back() });

  const lower = term.toLowerCase();
  const curated = searching ? STORIES.filter((s) => s.name.toLowerCase().includes(lower)) : STORIES;

  return (
    <Screen title="Add a stop" onBack={() => router.back()}>
      <SearchBar value={query} onChangeText={setQuery} />
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
              message="You can still add any of the curated places below."
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
  gap: { gap: space.sm },
});
