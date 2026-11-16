import { Pressable, StyleSheet } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';

type Props = { label: string; filled?: boolean; onPress?: () => void };

export function Chip({ label, filled, onPress }: Props) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: !!filled }}
      hitSlop={8}
      style={[styles.chip, { backgroundColor: filled ? c.primary : c.line }]}
    >
      <AppText variant="micro" tone={filled ? 'onPrimary' : 'ink'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
});
