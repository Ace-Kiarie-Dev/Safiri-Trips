import { z } from 'zod';

import raw from '../../assets/stories/kenya.json';
import { STORY_IMAGES } from './storyImages';
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

/** Bundled photo for a story, or null when none has been added yet. */
export const getStoryImage = (slug: string | null | undefined): number | null =>
  slug ? (STORY_IMAGES[slug] ?? null) : null;

export const randomStory = (): Story => STORIES[Math.floor(Math.random() * STORIES.length)]!;

/** A spread of places across categories for the Discover carousel. */
export function featuredStories(count = 8): Story[] {
  const byCat = new Map<CategoryId, Story[]>();
  for (const s of STORIES) byCat.set(s.category, [...(byCat.get(s.category) ?? []), s]);
  const out: Story[] = [];
  for (let round = 0; out.length < count; round++) {
    let added = false;
    for (const cat of CATEGORIES) {
      const s = byCat.get(cat.id)?.[round];
      if (s && out.length < count) {
        out.push(s);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}
