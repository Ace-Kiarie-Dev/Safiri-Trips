import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';
import { TabBar } from '@/components/TabBar';
import { useOnline } from '@/hooks/useOnline';
import { useColors } from '@/theme/useColors';

export default function TabsLayout() {
  const c = useColors();
  const online = useOnline();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {online ? null : <OfflineBanner insetTop />}
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Map' }} />
        <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
