import { StyleSheet, View } from 'react-native';

import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Props = { icon: IconName; value: string; label: string };

/** Wide pill with an icon, a big value and a small label. Lay out two per row. */
export function StatPill({ icon, value, label }: Props) {
  const c = useColors();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.pill, { backgroundColor: c.surface }]}
    >
      <View style={[styles.icon, { backgroundColor: c.skySoft }]}>
        <Icon name={icon} size={18} color={c.sky} />
      </View>
      <View style={styles.text}>
        <AppText variant="headline" numberOfLines={1}>
          {value}
        </AppText>
        <AppText variant="micro" tone="muted" numberOfLines={1}>
          {label.toUpperCase()}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    ...shadow.card,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
