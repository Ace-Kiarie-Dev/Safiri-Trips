import { Pressable, StyleSheet, View } from 'react-native';

import type { CategoryId } from '@/lib/stories';
import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { StoryPhoto } from './StoryPhoto';

type Props = {
  title: string;
  subtitle?: string;
  slug?: string | null;
  category?: CategoryId;
  imageUrl?: string | null;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** List row with a square photo thumbnail. Falls back to a tinted icon. */
export function PlaceRow({
  title,
  subtitle,
  slug,
  category,
  imageUrl,
  onPress,
  accessibilityLabel,
}: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}${subtitle ? `, ${subtitle}` : ''}`}
      android_ripple={{ color: c.line }}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: c.line }]}
    >
      <View style={styles.thumb}>
        <StoryPhoto slug={slug} category={category} uri={imageUrl} label={title} iconSize={22} />
      </View>
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevron" size={18} color={c.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, overflow: 'hidden' },
  text: { flex: 1 },
});
