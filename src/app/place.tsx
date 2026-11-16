import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { formatTemp } from '@/lib/format';
import { parsePlaceParams, toPlaceParams } from '@/lib/placeParams';
import { fetchNearby, fetchWeather, fetchWikiPlace } from '@/lib/queries';
import { categoryIcon, categoryLabel, getStory } from '@/lib/stories';
import { describeWeather } from '@/lib/weatherCode';
import { useSettings } from '@/state/settings';
import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const WIKI_PREFIX = 'https://en.wikipedia.org/';
const prettyKind = (kind: string) => kind.replaceAll('_', ' ');

export default function PlaceScreen() {
  const c = useColors();
  const router = useRouter();
  const units = useSettings((s) => s.units);
  const place = parsePlaceParams(useLocalSearchParams());
  const story = getStory(place?.slug);
  const lat = place?.lat ?? 0;
  const lng = place?.lng ?? 0;
  const isPin = place?.name === 'Dropped pin';

  const wiki = useQuery({
    queryKey: ['wiki', place?.slug ?? place?.name, lat.toFixed(3), lng.toFixed(3)],
    queryFn: () => fetchWikiPlace(lat, lng, isPin ? undefined : place?.name),
    enabled: !!place,
  });
  const weather = useQuery({
    queryKey: ['weather', lat.toFixed(2), lng.toFixed(2)],
    queryFn: () => fetchWeather(lat, lng),
    enabled: !!place,
  });
  const nearby = useQuery({
    queryKey: ['nearby', lat.toFixed(3), lng.toFixed(3)],
    queryFn: () => fetchNearby(lat, lng),
    enabled: !!place,
  });

  if (!place) {
    return (
      <Screen title="Place" onBack={() => router.back()}>
        <AppText tone="muted">That place could not be opened. Go back and pick it again.</AppText>
      </Screen>
    );
  }

  const today = weather.data?.days[0];
  const image = wiki.data?.imageUrl;
  const wikiUrl = wiki.data?.url.startsWith(WIKI_PREFIX) ? wiki.data.url : null;

  return (
    <Screen title={place.name} onBack={() => router.back()}>
      <View style={[styles.hero, { backgroundColor: c.primary }]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            accessibilityLabel={`Photo of ${place.name}`}
          />
        ) : (
          <Icon name={story ? categoryIcon[story.category] : 'pin'} size={56} color={c.gold} />
        )}
      </View>
      {image ? (
        <AppText variant="micro" tone="muted" style={styles.credit}>
          Photo via Wikipedia. See the article for author and licence.
        </AppText>
      ) : null}

      <View style={styles.chips}>
        {story ? <Chip label={categoryLabel(story.category)} filled /> : null}
        {place.subtitle ? <Chip label={story?.region ?? place.subtitle} /> : null}
        {today ? (
          <Chip label={`${describeWeather(today.code).label} · ${formatTemp(today.maxC, units)}`} />
        ) : null}
      </View>

      {story ? (
        <View style={styles.block}>
          <AppText variant="title">{story.summary}</AppText>
          <AppText style={styles.para}>{story.story}</AppText>
          <View style={[styles.note, { backgroundColor: c.surface, borderColor: c.line }]}>
            <AppText variant="label" tone="primary">
              Best time
            </AppText>
            <AppText>{story.bestTime}</AppText>
            <AppText variant="label" tone="primary" style={styles.noteGap}>
              Tip
            </AppText>
            <AppText>{story.tip}</AppText>
          </View>
          <AppText variant="micro" tone="muted">
            Checked against: {story.sources.join('; ')}
          </AppText>
        </View>
      ) : wiki.isPending ? (
        <Skeleton height={120} style={styles.block} />
      ) : wiki.data ? (
        <View style={styles.block}>
          <AppText style={styles.para}>{wiki.data.extract}</AppText>
          <AppText variant="micro" tone="muted">
            Text from Wikipedia, CC BY-SA 4.0.
          </AppText>
        </View>
      ) : (
        <AppText tone="muted" style={styles.block}>
          {wiki.isError
            ? 'The story for this place needs a connection. It will show once you are back online.'
            : 'We do not have a story for this spot yet. You can still add it to a trip.'}
        </AppText>
      )}

      {wikiUrl ? (
        <AppText
          variant="label"
          tone="primary"
          accessibilityRole="link"
          style={styles.link}
          onPress={() => void Linking.openURL(wikiUrl)}
        >
          Read more on Wikipedia
        </AppText>
      ) : null}

      <View style={styles.cta}>
        <Button
          label="Add to trip"
          icon="plus"
          onPress={() => router.push({ pathname: '/pick-trip', params: toPlaceParams(place) })}
        />
      </View>

      <AppText variant="headline" style={styles.heading}>
        Nearby
      </AppText>
      {nearby.isPending ? (
        <View style={styles.gap}>
          <Skeleton height={48} />
          <Skeleton height={48} />
        </View>
      ) : nearby.isError ? (
        <AppText tone="muted">
          Nearby places need a connection the first time you open a place.
        </AppText>
      ) : nearby.data.length === 0 ? (
        <AppText tone="muted">Nothing mapped close by. That usually means real wilderness.</AppText>
      ) : (
        nearby.data.slice(0, 12).map((p) => (
          <ListRow
            key={p.id}
            icon="pin"
            title={p.name}
            subtitle={prettyKind(p.kind)}
            onPress={() =>
              router.push({
                pathname: '/place',
                params: toPlaceParams({
                  name: p.name.slice(0, 80),
                  subtitle: prettyKind(p.kind),
                  lat: p.lat,
                  lng: p.lng,
                }),
              })
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credit: { marginTop: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  block: { marginTop: space.lg, gap: space.md },
  para: { fontSize: 16, lineHeight: 25 },
  note: { borderRadius: radius.md, borderWidth: 1, padding: space.lg, gap: space.xs },
  noteGap: { marginTop: space.sm },
  link: { marginTop: space.md, minHeight: 48, textAlignVertical: 'center' },
  cta: { marginTop: space.lg },
  heading: { marginTop: space.xxl, marginBottom: space.sm },
  gap: { gap: space.sm },
});
