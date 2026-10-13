import { json } from '@/server/http';
import { timeZoneCity, timeZoneOffset } from '@/shared/timeZones';
import type { TimeZoneOption } from '@/shared/types';

export function GET(): Response {
  const now = new Date();
  const zones: TimeZoneOption[] = Intl.supportedValuesOf('timeZone').map((id) => ({
    id,
    city: timeZoneCity(id),
    region: id.split('/')[0] ?? id,
    offset: timeZoneOffset(id, now),
  }));
  return json(zones);
}
