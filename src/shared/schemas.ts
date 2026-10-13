import { z } from 'zod';

import { isValidTimeZone } from './timeZones';

const timeZone = z.string().trim().refine(isValidTimeZone, 'Unknown time zone');

const updateSettingsBody = z.object({
  time_zone: timeZone,
  /** Only write when no time zone is stored yet (used for the device value at sign-in). */
  only_if_unset: z.boolean().default(false),
});

type UpdateSettingsBody = z.input<typeof updateSettingsBody>;

export { type UpdateSettingsBody, updateSettingsBody };
