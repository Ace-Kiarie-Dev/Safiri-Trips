import type { IconName } from '@/components/Icon';

/** WMO weather interpretation codes, as returned by Open-Meteo. */
export function describeWeather(code: number): { label: string; icon: IconName } {
  if (code === 0) return { label: 'Clear', icon: 'sun' };
  if (code <= 2) return { label: 'Partly cloudy', icon: 'sun' };
  if (code === 3) return { label: 'Cloudy', icon: 'cloud' };
  if (code <= 48) return { label: 'Fog', icon: 'cloud' };
  if (code <= 57) return { label: 'Drizzle', icon: 'rain' };
  if (code <= 67) return { label: 'Rain', icon: 'rain' };
  if (code <= 77) return { label: 'Snow', icon: 'cloud' };
  if (code <= 82) return { label: 'Showers', icon: 'rain' };
  if (code <= 86) return { label: 'Snow showers', icon: 'cloud' };
  return { label: 'Thunderstorm', icon: 'storm' };
}

/** US AQI bands. */
export function describeAqi(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very unhealthy';
  return 'Hazardous';
}
