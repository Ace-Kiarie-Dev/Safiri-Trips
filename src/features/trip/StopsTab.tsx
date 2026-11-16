import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { useTripMutation } from '@/hooks/useTrips';
import { formatDistance, formatDuration } from '@/lib/format';
import { toPlaceParams } from '@/lib/placeParams';
import type { RouteData } from '@/lib/schemas';
import { legIntoStop, returnLeg } from '@/lib/tripRoute';
import {
  MAX_STOPS,
  moveStop,
  removeStop,
  setRoundTrip,
  setTripOrigin,
  type Stop,
  type Trip,
} from '@/lib/trips';
import { useSettings } from '@/state/settings';
import { layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = { trip: Trip; stops: Stop[]; route: RouteData | null; routeNote: string | null };

export function StopsTab({ trip, stops, route, routeNote }: Props) {
  const c = useColors();
  const router = useRouter();
  const units = useSettings((s) => s.units);
  const tripId = trip.id;
  const move = useTripMutation(({ id, dir }: { id: string; dir: -1 | 1 }) =>
    moveStop(tripId, id, dir),
  );
  const remove = useTripMutation((id: string) => removeStop(tripId, id));
  const clearOrigin = useTripMutation(() => setTripOrigin(tripId, null));
  const toggleRound = useTripMutation((on: boolean) => setRoundTrip(tripId, on));
  const addStop = () => router.push({ pathname: '/add-stop', params: { tripId } });
  const pickOrigin = () =>
    router.push({ pathname: '/add-stop', params: { tripId, purpose: 'origin' } });

  const legText = (index: number | null) => {
    const leg = index !== null && index >= 0 ? route?.legs[index] : undefined;
    return leg
      ? `${formatDistance(leg.distanceM, units)} · ${formatDuration(leg.durationS)} drive`
      : 'Drive time not available';
  };

  const back = returnLeg(trip, stops.length);

  return (
    <View>
      {routeNote ? (
        <AppText variant="caption" tone="muted" style={styles.note}>
          {routeNote}
        </AppText>
      ) : null}

      {trip.origin ? (
        <View>
          <View style={[styles.stop, { backgroundColor: c.surface }]}>
            <View style={[styles.badge, { backgroundColor: c.gold }]}>
              <Icon name="pin" size={16} color={c.ink} />
            </View>
            <View style={styles.text}>
              <AppText variant="micro" tone="muted">
                START
              </AppText>
              <AppText variant="title" numberOfLines={1}>
                {trip.origin.name}
              </AppText>
            </View>
            <IconButton icon="settings" label="Change start point" onPress={pickOrigin} />
            <IconButton
              icon="close"
              label="Remove start point"
              onPress={() => clearOrigin.mutate(undefined)}
            />
          </View>
          {stops.length > 0 ? (
            <View style={styles.leg}>
              <View style={[styles.connector, { backgroundColor: c.handle }]} />
              <AppText variant="caption" tone="muted">
                {legText(legIntoStop(trip, 0))}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={pickOrigin}
          android_ripple={{ color: c.line }}
          style={[styles.setStart, { borderColor: c.handle }]}
        >
          <Icon name="locate" size={20} color={c.primary} />
          <View style={styles.text}>
            <AppText variant="title">Set your start point</AppText>
            <AppText variant="caption" tone="muted">
              Where the drive begins, so the first leg and total are right.
            </AppText>
          </View>
          <Icon name="chevron" size={18} color={c.muted} />
        </Pressable>
      )}

      {stops.length === 0 ? (
        <View style={styles.add}>
          <EmptyState
            icon="pin"
            title="Where to?"
            message="Add your destination first. Stops on the way come after."
            actionLabel="Add your destination"
            onAction={addStop}
          />
        </View>
      ) : (
        stops.map((s, i) => (
          <View key={s.id}>
            <View style={[styles.stop, { backgroundColor: c.surface }]}>
              {i === stops.length - 1 ? (
                <View style={[styles.badge, { backgroundColor: c.accent }]}>
                  <Icon name="pin" size={16} color={c.ink} />
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: c.primary }]}>
                  <AppText variant="label" tone="onPrimary">
                    {i + 1}
                  </AppText>
                </View>
              )}
              <View style={styles.text}>
                {i === stops.length - 1 ? (
                  <AppText variant="micro" tone="muted">
                    DESTINATION
                  </AppText>
                ) : null}
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
            {i < stops.length - 1 || back !== null ? (
              <View style={styles.leg}>
                <View style={[styles.connector, { backgroundColor: c.handle }]} />
                <AppText variant="caption" tone="muted">
                  {i < stops.length - 1 ? legText(legIntoStop(trip, i + 1)) : legText(back)}
                </AppText>
              </View>
            ) : null}
          </View>
        ))
      )}

      {back !== null && trip.origin ? (
        <View style={[styles.stop, { backgroundColor: c.surface }]}>
          <View style={[styles.badge, { backgroundColor: c.gold }]}>
            <Icon name="pin" size={16} color={c.ink} />
          </View>
          <View style={styles.text}>
            <AppText variant="micro" tone="muted">
              BACK TO
            </AppText>
            <AppText variant="title" numberOfLines={1}>
              {trip.origin.name}
            </AppText>
          </View>
        </View>
      ) : null}

      {trip.origin && stops.length > 0 ? (
        <View style={styles.toggle}>
          <View style={styles.text}>
            <AppText variant="title">Round trip</AppText>
            <AppText variant="caption" tone="muted">
              Add the drive back to {trip.origin.name}
            </AppText>
          </View>
          <Switch
            value={trip.roundTrip}
            onValueChange={(v) => toggleRound.mutate(v)}
            trackColor={{ true: c.primary, false: c.handle }}
            thumbColor={c.surface}
            accessibilityLabel="Round trip"
          />
        </View>
      ) : null}

      {stops.length > 0 ? (
        <View style={styles.add}>
          {stops.length < MAX_STOPS ? (
            <Button label="Add a stop on the way" icon="plus" variant="outline" onPress={addStop} />
          ) : (
            <AppText variant="caption" tone="muted">
              This trip has reached the limit of {MAX_STOPS} stops.
            </AppText>
          )}
        </View>
      ) : null}
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
  setStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: layout.tapTarget + space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: space.md,
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
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: layout.tapTarget,
    marginTop: space.lg,
  },
  add: { marginTop: space.lg },
});
