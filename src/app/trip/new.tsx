import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { TripForm } from '@/features/trip/TripForm';
import { useTripMutation } from '@/hooks/useTrips';
import { parsePlaceParams } from '@/lib/placeParams';
import { addStop, createTrip, type TripInput } from '@/lib/trips';

/** Creates a trip. When opened with a place in the params, that place becomes the first stop. */
export default function NewTripScreen() {
  const router = useRouter();
  const place = parsePlaceParams(useLocalSearchParams());

  const create = useTripMutation(async (input: TripInput) => {
    const id = await createTrip(input);
    if (place) await addStop(id, { ...place, storySlug: place.slug });
    return id;
  });

  return (
    <Screen title="New trip" onBack={() => router.back()}>
      <TripForm
        submitLabel={place ? `Create and add ${place.name}` : 'Create trip'}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: (id) => router.replace({ pathname: '/trip/[id]', params: { id } }),
          })
        }
      />
    </Screen>
  );
}
