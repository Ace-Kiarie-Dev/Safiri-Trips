import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { useTripList, useTripMutation } from '@/hooks/useTrips';
import { parsePlaceParams, toPlaceParams } from '@/lib/placeParams';
import { addStop, MAX_STOPS } from '@/lib/trips';
import { space } from '@/theme/tokens';

/** Second tap of "add a stop": choose which trip the place goes into. */
export default function PickTripScreen() {
  const router = useRouter();
  const place = parsePlaceParams(useLocalSearchParams());
  const trips = useTripList();
  const [full, setFull] = useState(false);

  const add = useTripMutation(async (tripId: string) => {
    if (!place) return { tripId, added: false };
    const added = await addStop(tripId, { ...place, storySlug: place.slug });
    return { tripId, added };
  });

  if (!place) {
    return (
      <Screen title="Add to trip" onBack={() => router.back()}>
        <AppText tone="muted">That place could not be opened. Go back and pick it again.</AppText>
      </Screen>
    );
  }

  return (
    <Screen title={`Add ${place.name}`} onBack={() => router.back()}>
      <View style={styles.gap}>
        {full ? (
          <AppText variant="label" tone="danger" accessibilityRole="alert">
            That trip already has {MAX_STOPS} stops, which is the most a trip can hold.
          </AppText>
        ) : null}
        {trips.isPending ? (
          <Skeleton height={56} />
        ) : (
          (trips.data ?? []).map((t) => (
            <ListRow
              key={t.id}
              icon="trips"
              title={t.title}
              subtitle={`${t.stopCount} ${t.stopCount === 1 ? 'stop' : 'stops'}`}
              onPress={() =>
                add.mutate(t.id, {
                  onSuccess: (r) =>
                    r.added
                      ? router.replace({ pathname: '/trip/[id]', params: { id: r.tripId } })
                      : setFull(true),
                })
              }
            />
          ))
        )}
        <Button
          label="New trip with this stop"
          icon="plus"
          variant={trips.data && trips.data.length > 0 ? 'outline' : 'primary'}
          onPress={() => router.replace({ pathname: '/trip/new', params: toPlaceParams(place) })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ gap: { gap: space.md } });
