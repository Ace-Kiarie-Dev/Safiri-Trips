import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const c = useColors();
  return (
    <View style={[styles.box, { borderColor: c.handle }]}>
      <Icon name={icon} size={48} color={c.primary} />
      <AppText variant="headline" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="label" tone="muted" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  title: { marginTop: space.xs },
  message: { textAlign: 'center', marginBottom: space.md },
});
