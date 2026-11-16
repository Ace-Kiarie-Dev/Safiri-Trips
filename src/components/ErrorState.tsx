import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

type Props = { title: string; message: string; onRetry: () => void };

export function ErrorState({ title, message, onRetry }: Props) {
  const c = useColors();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}
    >
      <View style={styles.icon}>
        <Icon name="alert" size={24} color={c.danger} />
      </View>
      <View style={styles.body}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="label" tone="muted">
          {message}
        </AppText>
        <View style={styles.action}>
          <Button label="Try again" variant="outline" onPress={onRetry} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space.md,
    borderRadius: radius.lg - 4,
    borderWidth: 1,
    padding: space.lg,
  },
  icon: { paddingTop: 2 },
  body: { flex: 1, gap: 2 },
  action: { marginTop: space.md, alignSelf: 'flex-start' },
});
