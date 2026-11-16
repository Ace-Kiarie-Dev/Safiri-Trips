import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { useSettings } from '@/state/settings';
import { space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const SLIDES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'map',
    title: 'Karibu Safiri Trips',
    body: 'Pick your stops across Kenya and we work out the drive, the weather and what to pack.',
  },
  {
    icon: 'download',
    title: 'Works with no signal',
    body: 'Save a trip before you leave. The route, map, forecast and stories stay on your phone.',
  },
  {
    icon: 'locate',
    title: 'Location is optional',
    body: 'If you tap the near me button, we ask for your location to centre the map on you. It is only used while the app is open, never in the background, and you can plan every trip without it.',
  },
];

export default function OnboardingScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setOnboarded = useSettings((s) => s.setOnboarded);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;

  const finish = () => {
    void setOnboarded();
    router.replace('/discover');
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: c.bg,
          paddingTop: insets.top + space.xxl,
          paddingBottom: insets.bottom + space.xxl,
        },
      ]}
    >
      <View style={styles.body} accessibilityLiveRegion="polite">
        <View style={[styles.art, { backgroundColor: c.primary }]}>
          <Icon name={slide.icon} size={64} color={c.gold} />
        </View>
        <AppText variant="display" tone="primary" style={styles.center}>
          {slide.title}
        </AppText>
        <AppText style={[styles.center, styles.copy]} tone="muted">
          {slide.body}
        </AppText>
      </View>
      <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of ${SLIDES.length}`}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[styles.dot, { backgroundColor: i === index ? c.accent : c.handle }]}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Button
          label={last ? 'Start planning' : 'Next'}
          onPress={last ? finish : () => setIndex(index + 1)}
        />
        {!last ? <Button label="Skip" variant="outline" onPress={finish} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xxl },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  art: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  copy: { fontSize: 16, lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginBottom: space.xl },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { gap: space.md },
});
