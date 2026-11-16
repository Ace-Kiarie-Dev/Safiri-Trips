import { Share } from 'react-native';

import { formatDay, formatDistance, formatDuration } from './format';
import type { RouteData } from './schemas';
import type { Stop, Trip } from './trips';
import type { Units } from '@/state/settings';

export function tripAsText(trip: Trip, stops: Stop[], route: RouteData | null, units: Units) {
  const lines = [`${trip.title}`];
  if (trip.startDate) {
    lines.push(`${formatDay(trip.startDate)} · ${trip.days} ${trip.days === 1 ? 'day' : 'days'}`);
  }
  lines.push('');
  stops.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.name}`);
    const leg = route?.legs[i];
    if (leg && i < stops.length - 1) {
      lines.push(
        `   ${formatDistance(leg.distanceM, units)} · ${formatDuration(leg.durationS)} drive`,
      );
    }
  });
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
