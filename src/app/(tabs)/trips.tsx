import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { useTripList } from '@/hooks/useTrips';
import { formatDay } from '@/lib/format';
import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function TripsScreen() {
  const c = useColors();
  const router = useRouter();
  const trips = useTripList();
  const newTrip = () => router.push('/trip/new');

  return (
    <Screen
      title="Your trips"
      right={<IconButton icon="plus" label="New trip" onPress={newTrip} />}
    >
      {trips.isPending ? (
        <View style={styles.list}>
          <Skeleton height={104} radius={radius.lg} />
          <Skeleton height={104} radius={radius.lg} />
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
          {trips.data.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${t.title}`}
              android_ripple={{ color: c.line }}
              onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
              style={[styles.card, { backgroundColor: c.surface }]}
            >
              <View style={[styles.cover, { backgroundColor: c.primary }]}>
                <Icon name="map" size={28} color={c.gold} />
              </View>
              <View style={styles.body}>
                <AppText variant="headline" numberOfLines={1}>
                  {t.title}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {t.startDate ? `${formatDay(t.startDate)} · ` : ''}
                  {t.days} {t.days === 1 ? 'day' : 'days'} · {t.stopCount}{' '}
                  {t.stopCount === 1 ? 'stop' : 'stops'}
                </AppText>
                {t.offlineAt ? <Chip label="Saved offline" filled /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 104,
    ...shadow.card,
  },
  cover: { width: 88, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: space.lg, gap: space.xs, justifyContent: 'center' },
});
