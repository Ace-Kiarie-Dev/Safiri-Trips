import { useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { cacheClear } from '@/lib/cache';
import { PRIVACY_URL } from '@/lib/config';
import { formatBytes, offlineStorageBytes } from '@/lib/offline';
import { deleteAllData } from '@/lib/wipe';
import { useSettings, type Units } from '@/state/settings';
import { space } from '@/theme/tokens';

const UNIT_OPTIONS = [
  { id: 'metric', label: 'km and °C' },
  { id: 'imperial', label: 'miles and °F' },
] as const satisfies readonly { id: Units; label: string }[];

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const units = useSettings((s) => s.units);
  const setUnits = useSettings((s) => s.setUnits);
  const load = useSettings((s) => s.load);
  const [message, setMessage] = useState<string | null>(null);
  const storage = useQuery({ queryKey: ['offline-bytes'], queryFn: offlineStorageBytes });

  const clearCache = async () => {
    await cacheClear();
    qc.removeQueries({
      predicate: (q) => q.queryKey[0] !== 'trips' && q.queryKey[0] !== 'packing',
    });
    setMessage('Cache cleared. Trips saved for offline were kept.');
  };

  const confirmDelete = () =>
    Alert.alert(
      'Delete all my data?',
      'This removes every trip, packing list, offline map, cached forecast and scheduled alert from this phone. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () =>
            void deleteAllData()
              .then(load)
              .then(() => setMessage('All your data has been deleted from this phone.'))
              .catch(() => setMessage('Something went wrong. Please try again.')),
        },
      ],
    );

  return (
    <Screen title="Settings" onBack={() => router.back()}>
      <AppText variant="title" style={styles.heading}>
        Units
      </AppText>
      <Segmented options={UNIT_OPTIONS} value={units} onChange={(u) => void setUnits(u)} />

      <AppText variant="title" style={styles.heading}>
        Storage
      </AppText>
      <ListRow
        icon="download"
        title="Offline maps"
        subtitle={
          storage.data !== undefined ? `${formatBytes(storage.data)} on this phone` : 'Checking…'
        }
      />
      <ListRow
        icon="trash"
        title="Clear cache"
        subtitle="Frees space. Offline trips stay."
        onPress={() => void clearCache()}
      />
      <ListRow
        icon="alert"
        title="Delete all my data"
        subtitle="Trips, lists, maps and alerts"
        onPress={confirmDelete}
      />
      {message ? (
        <AppText variant="caption" tone="muted" accessibilityLiveRegion="polite" style={styles.msg}>
          {message}
        </AppText>
      ) : null}

      <AppText variant="title" style={styles.heading}>
        About
      </AppText>
      <ListRow
        icon="bookmark"
        title="Attributions"
        subtitle="Maps, weather and story sources"
        onPress={() => router.push('/attributions')}
      />
      <ListRow
        icon="check"
        title="Privacy policy"
        subtitle="Opens nesturex.com"
        onPress={() => void Linking.openURL(PRIVACY_URL)}
      />
      <View style={styles.about}>
        <AppText variant="label">Safiri Trips {Constants.expoConfig?.version ?? ''}</AppText>
        <AppText variant="caption" tone="muted">
          Made in Nairobi by Nesture-X. Safiri is Swahili for &quot;to travel&quot;. Safari njema!
        </AppText>
        <AppText variant="caption" tone="muted">
          No account, no ads, no tracking. Your trips live on this phone only.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.xl, marginBottom: space.sm },
  msg: { marginTop: space.md },
  about: { marginTop: space.xl, gap: space.xs },
});
