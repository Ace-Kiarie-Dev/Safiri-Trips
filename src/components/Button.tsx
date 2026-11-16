import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  icon?: IconName;
  disabled?: boolean;
  flex?: number;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, flex }: Props) {
  const c = useColors();
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? c.onAccent : c.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { flex },
        isPrimary ? { backgroundColor: c.accent } : { borderColor: c.primary, borderWidth: 2 },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.85 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={20} color={fg} /> : null}
        <AppText variant="label" style={{ color: fg, fontSize: 15 }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    borderRadius: radius.pill,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
