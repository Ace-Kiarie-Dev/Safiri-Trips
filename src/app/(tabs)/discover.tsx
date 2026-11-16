import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const CATEGORIES = ['Coast', 'Safari', 'Mountains', 'Lakes', 'Heritage', 'City'];

export default function DiscoverScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.lg }]}>
      <AppText variant="display" tone="primary" style={styles.title}>
        Discover
      </AppText>
      <View style={styles.chips}>
        {CATEGORIES.map((name, i) => (
          <Chip key={name} label={name} filled={i === 0} />
        ))}
      </View>
      <EmptyState
        icon="compass"
        title="Stories are on the way"
        message="Kenya stories by category land in the next update."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.lg },
  title: { marginBottom: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl },
});
