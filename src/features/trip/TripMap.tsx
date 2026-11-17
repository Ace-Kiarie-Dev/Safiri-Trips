import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapView,
  ViewAnnotation,
  type CameraRef,
  type LngLatBounds,
} from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapPin } from '@/components/MapPin';
import { KENYA_CENTER, KENYA_ZOOM, MAP_STYLE_URL } from '@/lib/config';
import type { RouteData } from '@/lib/schemas';
import { routePoints } from '@/lib/tripRoute';
import type { Stop, Trip } from '@/lib/trips';
import { radius } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Props = { trip: Trip; stops: Stop[]; route: RouteData | null };

const PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

/** Route preview. Draws the real road route when we have it, a dashed straight line when we do not. */
export function TripMap({ trip, stops, route }: Props) {
  const c = useColors();
  const camera = useRef<CameraRef>(null);

  const line = useMemo<[number, number][]>(
    () => route?.geometry ?? routePoints(trip, stops).map((p) => [p.lng, p.lat]),
    [route, trip, stops],
  );

  const fit = useCallback(() => {
    if (line.length === 0) return;
    if (line.length === 1) {
      camera.current?.jumpTo({ center: line[0]!, zoom: 11 });
      return;
    }
    const lngs = line.map((p) => p[0]);
    const lats = line.map((p) => p[1]);
    const bounds: LngLatBounds = [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs),
      Math.max(...lats),
    ];
    camera.current?.fitBounds(bounds, { padding: PADDING, duration: 600 });
  }, [line]);

  useEffect(fit, [fit]);

  const feature = useMemo<GeoJSON.Feature<GeoJSON.LineString>>(
    () => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: line },
    }),
    [line],
  );

  return (
    <View style={[styles.frame, { backgroundColor: c.mapLand }]}>
      <MapView
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        logo={false}
        attribution
        touchRotate={false}
        touchPitch={false}
        onDidFinishLoadingMap={fit}
      >
        <Camera ref={camera} initialViewState={{ center: KENYA_CENTER, zoom: KENYA_ZOOM }} />
        {line.length >= 2 ? (
          <GeoJSONSource id="trip-route" data={feature}>
            <Layer
              type="line"
              id="trip-route-line"
              style={{
                lineColor: c.accent,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
                lineDasharray: route ? [1, 0] : [1, 2],
              }}
            />
          </GeoJSONSource>
        ) : null}
        {trip.origin ? (
          <ViewAnnotation id="origin" lngLat={[trip.origin.lng, trip.origin.lat]}>
            <MapPin tone="me" />
          </ViewAnnotation>
        ) : null}
        {stops.map((s, i) => (
          <ViewAnnotation key={`${i}-${s.id}`} id={`stop-${i}-${s.id}`} lngLat={[s.lng, s.lat]}>
            <MapPin label={String(i + 1)} tone="primary" />
          </ViewAnnotation>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 220, borderRadius: radius.lg, overflow: 'hidden' },
  map: { flex: 1 },
});
