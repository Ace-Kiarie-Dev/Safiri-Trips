import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { toPlaceParams } from '@/lib/placeParams';
import { CATEGORIES, categoryIcon, categoryLabel, STORIES, type CategoryId } from '@/lib/stories';
import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function DiscoverScreen() {
  const c = useColors();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const stories = category === 'all' ? STORIES : STORIES.filter((s) => s.category === category);

  return (
    <Screen title="Kenya Stories">
      <AppText variant="label" tone="muted">
        {STORIES.length} places, each with the story behind it. All of them work offline.
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chips}
      >
        <Chip label="All" filled={category === 'all'} onPress={() => setCategory('all')} />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            filled={category === cat.id}
            onPress={() => setCategory(cat.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.list}>
        {stories.map((s) => (
          <Pressable
            key={s.slug}
            accessibilityRole="button"
            accessibilityLabel={`${s.name}. ${s.summary}`}
            android_ripple={{ color: c.line }}
            onPress={() =>
              router.push({
                pathname: '/place',
                params: toPlaceParams({
                  name: s.name,
                  subtitle: s.region,
                  lat: s.lat,
                  lng: s.lng,
                  slug: s.slug,
                }),
              })
            }
            style={[styles.card, { backgroundColor: c.surface }]}
          >
            <View style={[styles.cover, { backgroundColor: c.primary }]}>
              <Icon name={categoryIcon[s.category]} size={28} color={c.gold} />
            </View>
            <View style={styles.body}>
              <AppText variant="micro" tone="muted">
                {categoryLabel(s.category).toUpperCase()} · {s.region.toUpperCase()}
              </AppText>
              <AppText variant="headline" numberOfLines={2}>
                {s.name}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {s.summary}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipScroll: { marginHorizontal: -space.lg, marginVertical: space.md },
  chips: { gap: space.sm, paddingHorizontal: space.lg, alignItems: 'center', minHeight: 48 },
  list: { gap: space.md },
  card: { flexDirection: 'row', borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  cover: { width: 76, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: space.lg, gap: 2 },
});
