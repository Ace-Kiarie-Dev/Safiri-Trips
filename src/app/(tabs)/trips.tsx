import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { StoryPhoto } from '@/components/StoryPhoto';
import { useDeleteTrip, useTripList } from '@/hooks/useTrips';
import { formatDay } from '@/lib/format';
import { getStory } from '@/lib/stories';
import type { Trip } from '@/lib/trips';
import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function TripsScreen() {
  const c = useColors();
  const router = useRouter();
  const trips = useTripList();
  const remove = useDeleteTrip();
  const newTrip = () => router.push('/trip/new');

  const confirmDelete = (t: Trip) =>
    Alert.alert(
      `Delete "${t.title}"?`,
      'Its stops, packing list, alerts and offline copy go too.',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(t.id) },
      ],
    );

  return (
    <Screen
      title="Your trips"
      right={<IconButton icon="plus" label="New trip" onPress={newTrip} />}
    >
      {trips.isPending ? (
        <View style={styles.list}>
          <Skeleton height={112} radius={radius.lg} />
          <Skeleton height={112} radius={radius.lg} />
        </View>
      ) : trips.isError ? (
        <ErrorState
          title="Could not load your trips"
          message="Your trips are stored on this phone. Try again."
          onRetry={() => void trips.refetch()}
        />
      ) : trips.data.length === 0 ? (
        <EmptyState
          icon="trips"
          title="No trips yet"
          message="Pick a few stops and Safiri works out the drive, the weather and what to pack."
          actionLabel="Plan a trip"
          onAction={newTrip}
        />
      ) : (
        <View style={styles.list}>
          {trips.data.map((t) => {
            const story = getStory(t.coverSlug);
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${t.title}`}
                accessibilityHint="Press and hold to delete"
                android_ripple={{ color: c.line }}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
                onLongPress={() => confirmDelete(t)}
                style={[styles.card, { backgroundColor: c.surface }]}
              >
                <View style={styles.cover}>
                  <StoryPhoto
                    slug={t.coverSlug}
                    category={story?.category}
                    label={story?.name ?? t.title}
                    iconSize={28}
                  />
                </View>
                <View style={styles.body}>
                  <AppText variant="headline" numberOfLines={1}>
                    {t.title}
                  </AppText>
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {t.startDate ? `${formatDay(t.startDate)} · ` : 'No dates · '}
                    {t.days} {t.days === 1 ? 'day' : 'days'} · {t.stopCount}{' '}
                    {t.stopCount === 1 ? 'stop' : 'stops'}
                  </AppText>
                  {t.offlineAt ? <Chip label="Saved offline" filled /> : null}
                </View>
                <IconButton
                  icon="trash"
                  label={`Delete ${t.title}`}
                  onPress={() => confirmDelete(t)}
                />
              </Pressable>
            );
          })}
          <AppText variant="caption" tone="muted" style={styles.hint}>
            Tap the bin, or press and hold a trip, to delete it.
          </AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 112,
    paddingRight: space.xs,
    ...shadow.card,
  },
  cover: { width: 104, alignSelf: 'stretch' },
  body: { flex: 1, padding: space.lg, gap: space.xs, justifyContent: 'center' },
  hint: { textAlign: 'center', marginTop: space.xs },
});
