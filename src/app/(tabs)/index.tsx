import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { StoryPhoto } from '@/components/StoryPhoto';
import { toPlaceParams } from '@/lib/placeParams';
import {
  CATEGORIES,
  categoryLabel,
  featuredStories,
  randomStory,
  STORIES,
  type CategoryId,
  type Story,
} from '@/lib/stories';
import { radius, shadow, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const CARD_GAP = space.md;

export default function DiscoverScreen() {
  const c = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(320, width - space.lg * 2 - 36);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const list = useRef<FlatList<Story>>(null);
  const featured = useMemo(() => featuredStories(8), []);
  const browse = category === 'all' ? STORIES : STORIES.filter((s) => s.category === category);

  const openStory = (s: Story) =>
    router.push({
      pathname: '/place',
      params: toPlaceParams({
        name: s.name,
        subtitle: s.region,
        lat: s.lat,
        lng: s.lng,
        slug: s.slug,
      }),
    });

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setPage(Math.max(0, Math.min(featured.length - 1, i)));
  };

  return (
    <Screen
      title="Karibu."
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Surprise me with a random place"
          onPress={() => openStory(randomStory())}
          style={[styles.surprise, { backgroundColor: c.gold }]}
        >
          <Icon name="shuffle" size={18} color={c.ink} />
          <AppText variant="label">Surprise me</AppText>
        </Pressable>
      }
    >
      <AppText variant="label" tone="muted" style={styles.sub}>
        Swipe through {STORIES.length} places worth the drive.
      </AppText>

      <FlatList
        ref={list}
        horizontal
        data={featured}
        keyExtractor={(s) => s.slug}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        style={styles.carousel}
        contentContainerStyle={[styles.carouselContent, { paddingRight: space.lg }]}
        renderItem={({ item: s }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${s.name}. ${s.summary}`}
            onPress={() => openStory(s)}
            style={[styles.card, { width: cardWidth, backgroundColor: c.surface }]}
          >
            <View style={styles.photo}>
              <StoryPhoto slug={s.slug} category={s.category} label={s.name} iconSize={44} />
            </View>
            <View style={styles.cardBody}>
              <AppText variant="micro" style={{ color: c.clay }}>
                {categoryLabel(s.category).toUpperCase()} · {s.region.toUpperCase()}
              </AppText>
              <AppText variant="display" numberOfLines={1} style={styles.cardTitle}>
                {s.name}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {s.summary}
              </AppText>
            </View>
          </Pressable>
        )}
      />
      <View style={styles.dots} accessibilityLabel={`Place ${page + 1} of ${featured.length}`}>
        {featured.map((s, i) => (
          <View
            key={s.slug}
            style={[
              styles.dot,
              i === page ? { width: 22, backgroundColor: c.accent } : { backgroundColor: c.line },
            ]}
          />
        ))}
      </View>

      <Button label="Plan a trip" icon="plus" onPress={() => router.push('/trip/new')} />

      <AppText variant="micro" tone="muted" style={styles.browseHeading}>
        BROWSE BY CATEGORY
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
      <View style={styles.rows}>
        {browse.map((s) => (
          <Pressable
            key={s.slug}
            accessibilityRole="button"
            accessibilityLabel={`${s.name}, ${categoryLabel(s.category)}, ${s.region}`}
            android_ripple={{ color: c.line }}
            onPress={() => openStory(s)}
            style={[styles.row, { borderBottomColor: c.line }]}
          >
            <View style={styles.thumb}>
              <StoryPhoto slug={s.slug} category={s.category} label={s.name} iconSize={22} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="title" numberOfLines={1}>
                {s.name}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {categoryLabel(s.category)} · {s.region}
              </AppText>
            </View>
            <Icon name="chevron" size={18} color={c.muted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  surprise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    marginRight: space.sm,
  },
  sub: { marginBottom: space.md },
  carousel: { marginHorizontal: -space.lg },
  carouselContent: { paddingLeft: space.lg, gap: CARD_GAP, paddingBottom: space.sm },
  card: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  photo: { height: 300 },
  cardBody: { padding: space.lg, gap: 2 },
  cardTitle: { marginTop: 2 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: space.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  browseHeading: { marginTop: space.xl, marginBottom: space.sm, letterSpacing: 1 },
  chipScroll: { marginHorizontal: -space.lg },
  chips: { gap: space.sm, paddingHorizontal: space.lg, alignItems: 'center', minHeight: 44 },
  rows: { marginTop: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, overflow: 'hidden' },
  rowText: { flex: 1 },
});
