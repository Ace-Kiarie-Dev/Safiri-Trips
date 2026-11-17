import type { ComponentRef, Ref } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { LogoTile } from '@/components/LogoTile';
import { StoryPhoto } from '@/components/StoryPhoto';
import { formatDay, formatDistance, formatDurationShort } from '@/lib/format';
import type { RouteData } from '@/lib/schemas';
import { getStory } from '@/lib/stories';
import { legIntoStop, returnLeg } from '@/lib/tripRoute';
import type { Stop, Trip } from '@/lib/trips';
import type { Units } from '@/state/settings';
import { fonts, lightColors as c, radius, space } from '@/theme/tokens';

export const SHARE_CARD_WIDTH = 360;

export type CardRef = Ref<ComponentRef<typeof View>>;

type Props = {
  trip: Trip;
  stops: Stop[];
  route: RouteData | null;
  units: Units;
  cardRef: CardRef;
};

/**
 * The picture people share. Always rendered in the light palette so it looks
 * the same on every phone, portrait so it fits a story or a chat.
 */
export function ShareCard({ trip, stops, route, units, cardRef }: Props) {
  const photos = stops.map((s) => getStory(s.storySlug)).filter((s) => s !== null);
  const legText = (index: number | null) => {
    const leg = index !== null && index >= 0 ? route?.legs[index] : undefined;
    return leg
      ? `${formatDistance(leg.distanceM, units)} · ${formatDurationShort(leg.durationS)}`
      : '';
  };
  const back = returnLeg(trip, stops.length);

  return (
    <View ref={cardRef} collapsable={false} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <LogoTile size={30} />
          <AppText variant="label" style={styles.brandText}>
            Safiri Trips
          </AppText>
        </View>
        <AppText variant="micro" style={styles.brandText}>
          SAFARI NJEMA
        </AppText>
      </View>

      {photos.length > 0 ? (
        <View style={styles.photos}>
          {photos.slice(0, 3).map((s) => (
            <View key={s.slug} style={styles.photo}>
              <StoryPhoto slug={s.slug} category={s.category} label={s.name} iconSize={20} />
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.body}>
        <AppText style={styles.title} numberOfLines={2}>
          {trip.title}
        </AppText>
        <AppText variant="caption" style={styles.sub}>
          {trip.startDate ? `${formatDay(trip.startDate)} · ` : ''}
          {trip.days} {trip.days === 1 ? 'day' : 'days'}
          {route
            ? ` · ${formatDistance(route.distanceM, units)} · ${formatDurationShort(route.durationS)} of driving`
            : ''}
        </AppText>

        <View style={styles.timeline}>
          {trip.origin ? (
            <TimelineRow
              dot={c.gold}
              label="START"
              name={trip.origin.name}
              leg={legText(legIntoStop(trip, 0))}
            />
          ) : null}
          {stops.map((s, i) => (
            <TimelineRow
              key={s.id}
              dot={i === stops.length - 1 ? c.accent : c.primary}
              label={i === stops.length - 1 ? 'DESTINATION' : `STOP ${i + 1}`}
              name={s.name}
              leg={
                i < stops.length - 1
                  ? legText(legIntoStop(trip, i + 1))
                  : back !== null
                    ? legText(back)
                    : ''
              }
            />
          ))}
          {back !== null && trip.origin ? (
            <TimelineRow dot={c.gold} label="BACK TO" name={trip.origin.name} leg="" last />
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="micro" style={styles.footerText}>
          Planned with Safiri Trips · free on Google Play · nesturex.com
        </AppText>
      </View>
    </View>
  );
}

function TimelineRow({
  dot,
  label,
  name,
  leg,
  last,
}: {
  dot: string;
  label: string;
  name: string;
  leg: string;
  last?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        {!last && leg !== '' ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.rowText}>
        <AppText variant="micro" style={styles.rowLabel}>
          {label}
        </AppText>
        <AppText variant="title" style={styles.rowName} numberOfLines={1}>
          {name}
        </AppText>
        {leg ? (
          <AppText variant="caption" style={styles.rowLeg}>
            {leg} drive
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    backgroundColor: c.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: c.primary,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  brandText: { color: c.onPrimary },
  photos: { flexDirection: 'row', gap: 3, height: 150 },
  photo: { flex: 1 },
  body: { padding: space.lg, gap: space.xs },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, color: c.ink },
  sub: { color: c.muted, marginBottom: space.sm },
  timeline: { marginTop: space.xs },
  row: { flexDirection: 'row', gap: space.md },
  rail: { width: 16, alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    borderWidth: 3,
    borderColor: c.surface,
  },
  line: { flex: 1, width: 2, backgroundColor: c.line, marginVertical: 2 },
  rowText: { flex: 1, paddingBottom: space.md },
  rowLabel: { color: c.clay, letterSpacing: 1 },
  rowName: { color: c.ink },
  rowLeg: { color: c.muted },
  footer: { paddingHorizontal: space.lg, paddingVertical: space.md, backgroundColor: c.surfaceAlt },
  footerText: { color: c.muted, textAlign: 'center' },
});
