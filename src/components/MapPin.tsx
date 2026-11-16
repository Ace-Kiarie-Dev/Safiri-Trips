import { StyleSheet, View } from 'react-native';

import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';

type Props = { label?: string; tone?: 'accent' | 'primary' | 'me' };

/** Marker drawn inside a MapLibre ViewAnnotation. */
export function MapPin({ label, tone = 'accent' }: Props) {
  const c = useColors();
  if (tone === 'me') {
    return <View style={[styles.me, { backgroundColor: c.primary, borderColor: c.surface }]} />;
  }
  return (
    <View
      style={[
        styles.pin,
        { backgroundColor: tone === 'accent' ? c.accent : c.primary, borderColor: c.surface },
      ]}
    >
      {label ? (
        <AppText variant="micro" tone={tone === 'accent' ? 'onAccent' : 'onPrimary'}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  me: { width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
});
