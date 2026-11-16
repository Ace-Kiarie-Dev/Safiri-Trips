import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';
import { TabBar } from '@/components/TabBar';
import { useOnline } from '@/hooks/useOnline';
import { useSettings } from '@/state/settings';
import { useColors } from '@/theme/useColors';

export const unstable_settings = { anchor: 'discover' };

export default function TabsLayout() {
  const c = useColors();
  const online = useOnline();
  const onboarded = useSettings((s) => s.onboarded);

  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {online ? null : <OfflineBanner insetTop />}
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="index" options={{ title: 'Plan' }} />
        <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
