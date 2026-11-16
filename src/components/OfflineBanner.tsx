import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = { message?: string; insetTop?: boolean };

export function OfflineBanner({
  message = 'You are offline. Showing your saved trips.',
  insetTop = false,
}: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.bar, { backgroundColor: c.primary, paddingTop: insetTop ? insets.top : 0 }]}
    >
      <View style={styles.row}>
        <Icon name="wifiOff" size={20} color={c.onPrimary} />
        <AppText variant="label" tone="onPrimary">
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: space.lg },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 },
});
