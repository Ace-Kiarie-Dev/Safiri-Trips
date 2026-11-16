import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { radius, space } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const CREDITS = [
  {
    name: 'OpenStreetMap',
    use: 'Map data, place search (Nominatim) and nearby places (Overpass API).',
    licence: '© OpenStreetMap contributors. Open Database License (ODbL).',
  },
  {
    name: 'OpenFreeMap and OpenMapTiles',
    use: 'Map tiles and map style.',
    licence: 'OpenFreeMap © OpenMapTiles. Data from OpenStreetMap.',
  },
  {
    name: 'Open-Meteo',
    use: 'Weather forecast, sunrise and sunset, and air quality.',
    licence: 'Weather data by Open-Meteo.com, CC BY 4.0.',
  },
  {
    name: 'OpenRouteService',
    use: 'Driving routes, distances and drive times.',
    licence: '© openrouteservice.org by HeiGIT. Map data © OpenStreetMap contributors.',
  },
  {
    name: 'Wikipedia',
    use: 'Place summaries and photos for places outside our own stories.',
    licence: 'Text under CC BY-SA 4.0. Photos keep the licence shown on their article.',
  },
  {
    name: 'MapLibre',
    use: 'The map engine inside the app.',
    licence: 'BSD licensed open source software.',
  },
  {
    name: 'Kenya Stories',
    use: 'The curated stories in Discover.',
    licence: 'Original writing © Nesture-X. Sources are listed under each story.',
  },
];

export default function AttributionsScreen() {
  const c = useColors();
  const router = useRouter();
  return (
    <Screen title="Attributions" onBack={() => router.back()}>
      <AppText tone="muted">
        Safiri Trips stands on open data and open source. Asante sana to everyone behind these
        projects.
      </AppText>
      <View style={styles.list}>
        {CREDITS.map((credit) => (
          <View key={credit.name} style={[styles.card, { backgroundColor: c.surface }]}>
            <AppText variant="title">{credit.name}</AppText>
            <AppText variant="label" tone="muted">
              {credit.use}
            </AppText>
            <AppText variant="caption">{credit.licence}</AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md, marginTop: space.lg },
  card: { borderRadius: radius.md, padding: space.lg, gap: space.xs },
});
