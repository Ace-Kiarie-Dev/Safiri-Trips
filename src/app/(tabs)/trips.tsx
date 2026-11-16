import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function TripsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.lg }]}>
      <AppText variant="display" tone="primary" style={styles.title}>
        Trips
      </AppText>
      <EmptyState
        icon="compass"
        title="No trips yet"
        message="Pick a place on the map and we will build the route."
        actionLabel="Plan your first trip"
        onAction={() => router.navigate('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.lg },
  title: { marginBottom: space.lg },
});
