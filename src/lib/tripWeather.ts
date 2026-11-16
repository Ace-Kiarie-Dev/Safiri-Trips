import { parseDay, toIsoDay } from './format';
import type { ForecastDay } from './schemas';

/** The forecast days that fall inside the trip. Falls back to the whole forecast when dates do not overlap. */
export function tripWindow(
  forecast: ForecastDay[],
  startDate: string | null,
  days: number,
): { days: ForecastDay[]; exact: boolean } {
  const start = startDate ? parseDay(startDate) : null;
  if (!start) return { days: forecast, exact: false };
  const wanted = new Set<string>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    wanted.add(toIsoDay(d));
  }
  const inside = forecast.filter((d) => wanted.has(d.date));
  return inside.length > 0 ? { days: inside, exact: true } : { days: forecast, exact: false };
}
