import { Pressable, StyleSheet, View } from 'react-native';

import { layout, radius } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';

type Props<T extends string> = {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const c = useColors();
  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: c.line }]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.id)}
            style={[styles.item, active && { backgroundColor: c.primary }]}
          >
            <AppText variant="label" tone={active ? 'onPrimary' : 'ink'}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.pill, padding: 4 },
  item: {
    flex: 1,
    minHeight: layout.tapTarget - 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
