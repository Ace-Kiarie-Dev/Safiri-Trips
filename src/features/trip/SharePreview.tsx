import * as Sharing from 'expo-sharing';
import { useRef, useState, type ComponentRef } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { savePng, slugify } from '@/lib/saveImage';
import type { RouteData } from '@/lib/schemas';
import type { Stop, Trip } from '@/lib/trips';
import { useSettings } from '@/state/settings';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { ShareCard } from './ShareCard';

type Props = {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
  stops: Stop[];
  route: RouteData | null;
};

/** Shows the share card, then hands a PNG of it to the system share sheet. */
export function SharePreview({ visible, onClose, trip, stops, route }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const units = useSettings((s) => s.units);
  const card = useRef<ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const capture = () => captureRef(card, { format: 'png', quality: 1, result: 'tmpfile' });

  const save = async () => {
    setError(null);
    setSaved(null);
    setBusy(true);
    try {
      const result = await savePng(await capture(), `safiri-${slugify(trip.title)}`);
      if (result.ok) setSaved(`Saved to ${result.folder} as ${result.name}`);
      else if (!result.canceled) setError('Could not save the picture. Try again.');
    } catch {
      setError('Could not save the picture. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setError(null);
    setSaved(null);
    setBusy(true);
    try {
      const uri = await capture();
      if (!(await Sharing.isAvailableAsync())) {
        setError('Sharing is not available on this phone.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: trip.title });
    } catch {
      setError('Could not make the picture. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <IconButton icon="close" label="Close" onPress={onClose} />
          <AppText variant="headline" style={styles.flex}>
            Share as a picture
          </AppText>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ShareCard cardRef={card} trip={trip} stops={stops} route={route} units={units} />
          <AppText variant="caption" tone="muted" style={styles.hint}>
            Looks the same in WhatsApp, Instagram stories and anywhere else you send it.
          </AppText>
        </ScrollView>
        <View style={[styles.actions, { paddingBottom: insets.bottom + space.lg }]}>
          {error ? (
            <AppText variant="caption" tone="danger" accessibilityRole="alert">
              {error}
            </AppText>
          ) : null}
          {saved ? (
            <AppText variant="caption" tone="primary" accessibilityLiveRegion="polite">
              {saved}
            </AppText>
          ) : null}
          <View style={styles.buttons}>
            <Button
              flex={1}
              variant="outline"
              label="Save to phone"
              icon="download"
              disabled={busy}
              onPress={() => void save()}
            />
            <Button
              flex={1}
              label={busy ? 'Preparing…' : 'Share'}
              icon="share"
              disabled={busy}
              onPress={() => void share()}
            />
          </View>
          <AppText variant="micro" tone="muted" style={styles.hint}>
            The first save asks you to pick a folder, such as Pictures. After that it saves straight
            there.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    minHeight: 56,
  },
  scroll: { alignItems: 'center', padding: space.lg, gap: space.md },
  hint: { textAlign: 'center' },
  actions: { paddingHorizontal: space.lg, gap: space.sm },
  buttons: { flexDirection: 'row', gap: space.md },
});
