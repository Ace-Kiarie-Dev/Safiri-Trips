import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { tripKeys } from '@/hooks/useTrips';
import { cancelTripAlerts, hasTripAlerts, scheduleTripAlerts } from '@/lib/alerts';
import { formatBytes, planPack, removeTripOffline, saveTripOffline } from '@/lib/offline';
import type { ForecastDay, RouteData } from '@/lib/schemas';
import { routePoints } from '@/lib/tripRoute';
import type { Stop, Trip } from '@/lib/trips';
import { space } from '@/theme/tokens';

type Props = {
  trip: Trip;
  stops: Stop[];
  route: RouteData | null;
  forecasts: { stop: Stop; days: ForecastDay[] }[];
  online: boolean;
};

/** Offline download and rain alerts for one trip. */
export function TripActions({ trip, stops, route, forecasts, online }: Props) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const alertsKey = ['alerts', trip.id];
  const alerts = useQuery({ queryKey: alertsKey, queryFn: () => hasTripAlerts(trip.id) });
  const refreshTrips = () => qc.invalidateQueries({ queryKey: tripKeys.all });

  const download = () => {
    const points: [number, number][] =
      route?.geometry ?? routePoints(trip, stops).map((p) => [p.lng, p.lat]);
    const plan = planPack(points);
    Alert.alert(
      'Save trip offline?',
      `This saves the route, forecast, stories and a map of the route area. The map download is about ${formatBytes(plan.bytes)} (estimate). Wi-Fi is a good idea.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            setMessage(null);
            setProgress(0);
            saveTripOffline(trip.id, stops, plan, setProgress)
              .then(() => setMessage('Saved. This trip now works with no signal.'))
              .catch(() =>
                setMessage('The download did not finish. Check your connection and try again.'),
              )
              .finally(() => {
                setProgress(null);
                void refreshTrips();
              });
          },
        },
      ],
    );
  };

  const toggleAlerts = async () => {
    if (alerts.data) {
      await cancelTripAlerts(trip.id);
      setMessage('Trip alerts turned off.');
    } else {
      const result = await scheduleTripAlerts(trip, forecasts);
      setMessage(
        result.ok
          ? result.count > 0
            ? `Done. ${result.count} ${result.count === 1 ? 'alert' : 'alerts'} scheduled for this trip.`
            : 'Nothing to schedule yet. Alerts cover the next 7 days, so check back nearer the date.'
          : result.reason,
      );
    }
    void qc.invalidateQueries({ queryKey: alertsKey });
  };

  if (stops.length === 0 && !trip.origin) return null;

  return (
    <View style={styles.wrap}>
      {progress !== null ? (
        <AppText variant="label" accessibilityLiveRegion="polite">
          Downloading for offline use… {progress}%
        </AppText>
      ) : trip.offlineAt ? (
        <Button
          label="Remove offline copy"
          icon="trash"
          variant="outline"
          onPress={() =>
            void removeTripOffline(trip.id)
              .then(() => setMessage('Offline copy removed.'))
              .finally(refreshTrips)
          }
        />
      ) : (
        <Button label="Save for offline" icon="download" disabled={!online} onPress={download} />
      )}
      <Button
        label={alerts.data ? 'Turn off trip alerts' : 'Rain and trip alerts'}
        icon="bell"
        variant="outline"
        onPress={() => void toggleAlerts()}
      />
      {message ? (
        <AppText variant="caption" tone="muted" accessibilityLiveRegion="polite">
          {message}
        </AppText>
      ) : !online && !trip.offlineAt ? (
        <AppText variant="caption" tone="muted">
          Connect to the internet to save this trip for offline use.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: space.md, marginTop: space.xl } });
