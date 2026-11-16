import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';

type Props = { label: string; filled?: boolean };

export function Chip({ label, filled }: Props) {
  const c = useColors();
  return (
    <View style={[styles.chip, { backgroundColor: filled ? c.primary : c.line }]}>
      <AppText variant="micro" tone={filled ? 'onPrimary' : 'ink'}>
        {label}
      </AppText>
    </View>
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
