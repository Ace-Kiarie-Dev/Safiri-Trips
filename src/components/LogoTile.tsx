import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { lightColors } from '@/theme/tokens';

const MARK = require('../../assets/branding/mark-transparent.png');

type Props = { size?: number };

/** The Safiri mark on a cream tile, readable on any background. */
export function LogoTile({ size = 36 }: Props) {
  // The source art has generous padding, so draw it larger than the tile and clip.
  const art = size * 1.55;
  return (
    <View
      accessible
      accessibilityLabel="Safiri Trips logo"
      style={[styles.tile, { width: size, height: size, borderRadius: size * 0.28 }]}
    >
      <Image source={MARK} style={{ width: art, height: art }} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: lightColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
