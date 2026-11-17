import { z } from 'zod';

import raw from '../../assets/stories/waypoints.json';
import type { IconName } from '@/components/Icon';

const KINDS = ['viewpoint', 'nature', 'culture', 'food', 'wildlife', 'heritage', 'town'] as const;
export type WaypointKind = (typeof KINDS)[number];

const waypointSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  corridor: z.string(),
  kind: z.enum(KINDS),
  lat: z.number(),
  lng: z.number(),
  blurb: z.string(),
  tip: z.string(),
});
export type Waypoint = z.infer<typeof waypointSchema>;

/** Short roadside stops along the main corridors. Lighter than a story, but offline and ours. */
export const WAYPOINTS: Waypoint[] = z.array(waypointSchema).parse(raw);

const bySlug = new Map(WAYPOINTS.map((w) => [w.slug, w]));
export const getWaypoint = (slug: string | null | undefined) =>
  slug ? (bySlug.get(slug) ?? null) : null;

export const waypointIcon: Record<WaypointKind, IconName> = {
  viewpoint: 'sun',
  nature: 'map',
  culture: 'bookmark',
  food: 'home',
  wildlife: 'compass',
  heritage: 'bookmark',
  town: 'pin',
};

export const waypointLabel: Record<WaypointKind, string> = {
  viewpoint: 'Viewpoint',
  nature: 'Nature',
  culture: 'Culture',
  food: 'Food stop',
  wildlife: 'Wildlife',
  heritage: 'Heritage',
  town: 'Town',
};
