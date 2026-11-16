import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
};

export function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
  canDecrease = true,
  canIncrease = true,
}: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }]}>
        <IconButton
          icon="down"
          label={`Decrease ${label}`}
          onPress={onDecrease}
          disabled={!canDecrease}
        />
        <AppText variant="title" style={styles.value} accessibilityLiveRegion="polite">
          {value}
        </AppText>
        <IconButton
          icon="up"
          label={`Increase ${label}`}
          onPress={onIncrease}
          disabled={!canIncrease}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1 },
  value: { flex: 1, textAlign: 'center' },
});
