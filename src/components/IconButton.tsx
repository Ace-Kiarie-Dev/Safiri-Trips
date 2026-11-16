import { Pressable, StyleSheet } from 'react-native';

import { layout, shadow } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Raised circular surface, for buttons floating over the map or a photo. */
  raised?: boolean;
};

export function IconButton({ icon, label, onPress, disabled, raised }: Props) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      android_ripple={{ color: c.line, borderless: true }}
      style={[
        styles.button,
        raised && [styles.raised, { backgroundColor: c.surface }],
        disabled && styles.disabled,
      ]}
    >
      <Icon name={icon} size={22} color={c.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.tapTarget,
    height: layout.tapTarget,
    borderRadius: layout.tapTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: { ...shadow.card },
  disabled: { opacity: 0.35 },
});
