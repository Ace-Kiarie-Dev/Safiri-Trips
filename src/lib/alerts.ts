import * as Notifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

import { formatDay, parseDay } from './format';
import type { ForecastDay } from './schemas';
import { getAlertIds, setAlertIds, type Stop, type Trip } from './trips';

const CHANNEL = 'trip-alerts';
const RAIN_THRESHOLD = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Trip alerts',
      importance: AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function cancelTripAlerts(tripId: string) {
  const ids = await getAlertIds(tripId);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await setAlertIds(tripId, []);
}

export const hasTripAlerts = async (tripId: string) => (await getAlertIds(tripId)).length > 0;

async function schedule(title: string, body: string, date: Date): Promise<string | null> {
  if (date.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL },
  });
}

export type AlertResult = { ok: true; count: number } | { ok: false; reason: string };

/**
 * Schedules local notifications from the forecast we already have: a reminder the
 * evening before departure, and a 7am heads-up the day before any rainy trip day.
 * Nothing runs in the background and no location is used.
 */
export async function scheduleTripAlerts(
  trip: Trip,
  forecasts: { stop: Stop; days: ForecastDay[] }[],
): Promise<AlertResult> {
  const start = trip.startDate ? parseDay(trip.startDate) : null;
  if (!start) return { ok: false, reason: 'Add a start date to the trip first.' };
  if (!(await ensurePermission())) {
    return { ok: false, reason: 'Notifications are off for Safiri Trips.' };
  }
  await cancelTripAlerts(trip.id);

  const ids: (string | null)[] = [];
  const eve = new Date(start);
  eve.setDate(start.getDate() - 1);
  eve.setHours(18, 0, 0, 0);
  ids.push(
    await schedule('Safari njema!', `${trip.title} starts tomorrow. Check your packing list.`, eve),
  );

  for (let i = 0; i < trip.days; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    let worst: { name: string; pct: number } | null = null;
    for (const f of forecasts) {
      const d = f.days.find((x) => x.date === iso);
      if (d && d.rainPct >= RAIN_THRESHOLD && (!worst || d.rainPct > worst.pct)) {
        worst = { name: f.stop.name, pct: d.rainPct };
      }
    }
    if (!worst) continue;
    const when = new Date(day);
    when.setDate(day.getDate() - 1);
    when.setHours(7, 0, 0, 0);
    ids.push(
      await schedule(
        'Rain on your trip',
        `${worst.pct}% chance of rain at ${worst.name} on ${formatDay(iso)}. Pack a jacket.`,
        when,
      ),
    );
  }
  const scheduled = ids.filter((x): x is string => x !== null);
  await setAlertIds(trip.id, scheduled);
  return { ok: true, count: scheduled.length };
}

export const cancelAllAlerts = () => Notifications.cancelAllScheduledNotificationsAsync();
