import { z } from 'zod';

import raw from '../../assets/stories/kenya.json';
import type { IconName } from '@/components/Icon';

export const CATEGORIES = [
  { id: 'coast', label: 'Coast' },
  { id: 'safari', label: 'Safari' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'lakes', label: 'Lakes' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'city', label: 'City' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

const storySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.enum(['coast', 'safari', 'mountains', 'lakes', 'heritage', 'city']),
  region: z.string(),
  lat: z.number(),
  lng: z.number(),
  summary: z.string(),
  story: z.string(),
  bestTime: z.string(),
  tip: z.string(),
  imageCredit: z.string(),
  sources: z.array(z.string()),
});

export type Story = z.infer<typeof storySchema>;

export const STORIES: Story[] = z.array(storySchema).parse(raw);

const bySlug = new Map(STORIES.map((s) => [s.slug, s]));

export const getStory = (slug: string | null | undefined) =>
  slug ? (bySlug.get(slug) ?? null) : null;

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const categoryIcon: Record<CategoryId, IconName> = {
  coast: 'sun',
  safari: 'compass',
  mountains: 'map',
  lakes: 'rain',
  heritage: 'bookmark',
  city: 'pin',
};
