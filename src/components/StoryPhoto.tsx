import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { categoryIcon, getStoryImage, type CategoryId } from '@/lib/stories';
import { useColors } from '@/theme/useColors';
import { Icon } from './Icon';

type Props = {
  slug?: string | null;
  category?: CategoryId;
  /** Remote fallback, used when there is no bundled photo (for example a Wikipedia thumbnail). */
  uri?: string | null;
  label: string;
  iconSize?: number;
};

/** A place photo with a warm, on brand fallback when no photo exists. Fills its parent. */
export function StoryPhoto({ slug, category, uri, label, iconSize = 32 }: Props) {
  const c = useColors();
  const bundled = getStoryImage(slug);
  const source = bundled ?? (uri ? { uri } : null);
  const tint =
    category === 'coast' || category === 'lakes'
      ? c.skySoft
      : category === 'safari' || category === 'heritage'
        ? c.sunSoft
        : c.primarySoft;

  if (source) {
    return (
      <Image
        source={source}
        style={styles.fill}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`Photo of ${label}`}
      />
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={`${label}, no photo yet`}
      style={[styles.fill, styles.center, { backgroundColor: tint }]}
    >
      <Icon name={category ? categoryIcon[category] : 'pin'} size={iconSize} color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
