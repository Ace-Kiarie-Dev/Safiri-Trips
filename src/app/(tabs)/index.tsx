import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { SheetSurface } from '@/components/SheetSurface';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const SNAP_POINTS = [300, 520, 700];

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.root, { backgroundColor: c.mapLand }]}>
      <View style={[styles.search, { top: insets.top + space.lg }]}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>
      <SheetSurface snapPoints={SNAP_POINTS}>
        <AppText variant="display" tone="primary">
          Karibu. Where to next?
        </AppText>
        <AppText variant="label" tone="muted" style={styles.sub}>
          Plan a road trip across Kenya, even with no signal.
        </AppText>
        <Button label="Plan a trip" icon="plus" onPress={() => router.navigate('/trips')} />
      </SheetSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { position: 'absolute', left: space.lg, right: space.lg },
  sub: { marginTop: space.xs, marginBottom: space.lg },
});
