import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { layout, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
};

export function ListRow({ icon, title, subtitle, onPress, right }: Props) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      android_ripple={{ color: c.line }}
      style={[styles.row, { borderBottomColor: c.line }]}
    >
      <View style={[styles.icon, { backgroundColor: c.indicator }]}>
        <Icon name={icon} size={20} color={c.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron" size={18} color={c.muted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.tapTarget + space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
