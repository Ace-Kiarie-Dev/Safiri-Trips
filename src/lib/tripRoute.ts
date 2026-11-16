import type { Stop, Trip } from './trips';

export type RoutePoint = { lat: number; lng: number; name: string };

/**
 * The ordered points a trip is routed through: the start point if set, every
 * stop, and the start point again for a round trip. Everything that needs the
 * route (detail screen, map, share text, offline bundle) builds it from here,
 * so the cache key is identical everywhere.
 */
export function routePoints(trip: Pick<Trip, 'origin' | 'roundTrip'>, stops: Stop[]): RoutePoint[] {
  const points: RoutePoint[] = [];
  if (trip.origin) points.push(trip.origin);
  for (const s of stops) points.push({ lat: s.lat, lng: s.lng, name: s.name });
  if (trip.origin && trip.roundTrip && stops.length > 0) points.push(trip.origin);
  return points;
}

/** Leg index in the route for the drive that arrives at stop `i` (0 based). */
export const legIntoStop = (trip: Pick<Trip, 'origin'>, i: number) => (trip.origin ? i : i - 1);

/** Leg index for the drive that leaves the last stop and returns to the start. */
export const returnLeg = (trip: Pick<Trip, 'origin' | 'roundTrip'>, stopCount: number) =>
  trip.origin && trip.roundTrip && stopCount > 0 ? legIntoStop(trip, stopCount) : null;
