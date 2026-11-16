import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { useTripMutation } from '@/hooks/useTrips';
import { formatDistance, formatDuration } from '@/lib/format';
import { toPlaceParams } from '@/lib/placeParams';
import type { RouteData } from '@/lib/schemas';
import { MAX_STOPS, moveStop, removeStop, type Stop } from '@/lib/trips';
import { useSettings } from '@/state/settings';
import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = { tripId: string; stops: Stop[]; route: RouteData | null; routeNote: string | null };

export function StopsTab({ tripId, stops, route, routeNote }: Props) {
  const c = useColors();
  const router = useRouter();
  const units = useSettings((s) => s.units);
  const move = useTripMutation(({ id, dir }: { id: string; dir: -1 | 1 }) =>
    moveStop(tripId, id, dir),
  );
  const remove = useTripMutation((id: string) => removeStop(tripId, id));
  const addStop = () => router.push({ pathname: '/add-stop', params: { tripId } });

  if (stops.length === 0) {
    return (
      <EmptyState
        icon="pin"
        title="No stops yet"
        message="Add the places you want to visit. Two or more and we will work out the drive."
        actionLabel="Add a stop"
        onAction={addStop}
      />
    );
  }

  return (
    <View>
      {routeNote ? (
        <AppText variant="caption" tone="muted" style={styles.note}>
          {routeNote}
        </AppText>
      ) : null}
      {stops.map((s, i) => {
        const leg = route?.legs[i];
        return (
          <View key={s.id}>
            <View style={[styles.stop, { backgroundColor: c.surface }]}>
              <View style={[styles.badge, { backgroundColor: c.primary }]}>
                <AppText variant="label" tone="onPrimary">
                  {i + 1}
                </AppText>
              </View>
              <View style={styles.text}>
                <AppText
                  variant="title"
                  numberOfLines={1}
                  accessibilityRole="link"
                  onPress={() =>
                    router.push({
                      pathname: '/place',
                      params: toPlaceParams({ ...s, slug: s.storySlug ?? undefined }),
                    })
                  }
                >
                  {s.name}
                </AppText>
                {s.subtitle ? (
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {s.subtitle}
                  </AppText>
                ) : null}
              </View>
              <IconButton
                icon="up"
                label={`Move ${s.name} earlier`}
                disabled={i === 0}
                onPress={() => move.mutate({ id: s.id, dir: -1 })}
              />
              <IconButton
                icon="down"
                label={`Move ${s.name} later`}
                disabled={i === stops.length - 1}
                onPress={() => move.mutate({ id: s.id, dir: 1 })}
              />
              <IconButton
                icon="trash"
                label={`Remove ${s.name}`}
                onPress={() => remove.mutate(s.id)}
              />
            </View>
            {i < stops.length - 1 ? (
              <View style={styles.leg}>
                <View style={[styles.connector, { backgroundColor: c.handle }]} />
                <AppText variant="caption" tone="muted">
                  {leg
                    ? `${formatDistance(leg.distanceM, units)} · ${formatDuration(leg.durationS)} drive`
                    : 'Drive time not available'}
                </AppText>
              </View>
            ) : null}
          </View>
        );
      })}
      <View style={styles.add}>
        {stops.length < MAX_STOPS ? (
          <Button label="Add a stop" icon="plus" variant="outline" onPress={addStop} />
        ) : (
          <AppText variant="caption" tone="muted">
            This trip has reached the limit of {MAX_STOPS} stops.
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { marginBottom: space.md },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingLeft: space.md,
    paddingVertical: space.xs,
    gap: space.xs,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, marginLeft: space.sm },
  leg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingLeft: space.md + 13,
    height: 36,
  },
  connector: { width: 2, height: 36 },
  add: { marginTop: space.lg },
});
