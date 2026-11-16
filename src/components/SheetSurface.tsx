import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = {
  /** Visible heights in dp, smallest first (peek, half, full). */
  snapPoints: number[];
  initialIndex?: number;
  /** Fires on every snap with the visible sheet height, so the map can pad itself. */
  onVisibleHeight?: (height: number) => void;
  children: ReactNode;
};

export function SheetSurface({ snapPoints, initialIndex = 0, onVisibleHeight, children }: Props) {
  const c = useColors();
  return (
    <BottomSheet
      index={initialIndex}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onChange={(index) => {
        const height = snapPoints[index];
        if (height !== undefined) onVisibleHeight?.(height);
      }}
      backgroundStyle={[styles.surface, { backgroundColor: c.surface }]}
      handleIndicatorStyle={[styles.handle, { backgroundColor: c.handle }]}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  surface: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow.sheet },
  handle: { width: 40, height: 5 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
});
