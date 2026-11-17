import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Skeleton } from './Skeleton';

type Props = { title: string; message: string };

/** A clear "working on it" block: spinner, plain words and placeholder rows. */
export function FindingCard({ title, message }: Props) {
  const c = useColors();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${title}. ${message}`}
      style={[styles.card, { backgroundColor: c.surface }]}
    >
      <View style={styles.head}>
        <ActivityIndicator size="large" color={c.accent} />
        <View style={styles.text}>
          <AppText variant="title">{title}</AppText>
          <AppText variant="caption" tone="muted">
            {message}
          </AppText>
        </View>
      </View>
      <View style={styles.rows}>
        <Skeleton height={56} radius={radius.sm} />
        <Skeleton height={56} radius={radius.sm} />
        <Skeleton height={56} radius={radius.sm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.lg, ...shadow.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  text: { flex: 1, gap: 2 },
  rows: { gap: space.sm },
});
