import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { layout, radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, IconName> = { index: 'map', trips: 'trips', discover: 'compass' };

export function TabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const c = useColors();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: c.surface,
          borderTopColor: c.line,
          height: layout.navBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const color = focused ? c.primary : c.muted;

        const onPress = () => {
          if (!focused) navigateToTab(route.key);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.item}
          >
            <View style={[styles.pill, focused && { backgroundColor: c.indicator }]}>
              <Icon name={ICONS[route.name] ?? 'map'} color={color} />
            </View>
            <AppText variant="micro" style={{ color }}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1 },
  item: { flex: 1, alignItems: 'center', gap: space.xs, paddingTop: space.md },
  pill: {
    width: 64,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
