import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Set false when the body manages its own scrolling. */
  scroll?: boolean;
  children: ReactNode;
};

/** Full screen page with a safe-area header. Used by every screen that is not the map. */
export function Screen({ title, onBack, right, scroll = true, children }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        {onBack ? <IconButton icon="back" label="Go back" onPress={onBack} /> : null}
        <AppText
          variant="headline"
          numberOfLines={1}
          accessibilityRole="header"
          style={[styles.title, !onBack && styles.titleInset]}
        >
          {title}
        </AppText>
        {right}
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.root}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    gap: space.xs,
  },
  title: { flex: 1 },
  titleInset: { paddingLeft: space.sm },
  content: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
