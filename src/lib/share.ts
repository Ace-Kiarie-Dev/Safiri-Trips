import { Share } from 'react-native';

import { formatDay, formatDistance, formatDuration } from './format';
import type { RouteData } from './schemas';
import { legIntoStop, returnLeg } from './tripRoute';
import type { Stop, Trip } from './trips';
import type { Units } from '@/state/settings';

export function tripAsText(trip: Trip, stops: Stop[], route: RouteData | null, units: Units) {
  const lines = [`${trip.title}`];
  if (trip.startDate) {
    lines.push(`${formatDay(trip.startDate)} · ${trip.days} ${trip.days === 1 ? 'day' : 'days'}`);
  }
  lines.push('');
  const legLine = (index: number | null) => {
    const leg = index !== null && index >= 0 ? route?.legs[index] : undefined;
    if (leg) {
      lines.push(
        `   ${formatDistance(leg.distanceM, units)} · ${formatDuration(leg.durationS)} drive`,
      );
    }
  };
  if (trip.origin) {
    lines.push(`Start: ${trip.origin.name}`);
    if (stops.length > 0) legLine(legIntoStop(trip, 0));
  }
  stops.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.name}`);
    if (i < stops.length - 1) legLine(legIntoStop(trip, i + 1));
  });
  const back = returnLeg(trip, stops.length);
  if (back !== null && trip.origin) {
    legLine(back);
    lines.push(`Back to ${trip.origin.name}`);
  }
  if (route) {
    lines.push(
      '',
      `Total: ${formatDistance(route.distanceM, units)} · ${formatDuration(route.durationS)}`,
    );
  }
  lines.push('', 'Planned with Safiri Trips. Safari njema!');
  return lines.join('\n');
}

/** Plain text only, through the system share sheet. */
export const shareTrip = (text: string) => Share.share({ message: text });
