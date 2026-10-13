import { z } from 'zod';

import { isValidTimeZone } from './timeZones';

const timeZone = z.string().trim().refine(isValidTimeZone, 'Unknown time zone');

const updateSettingsInput = z.object({
  timeZone,
  /** Only write when no time zone is stored yet (used for the device value at sign-in). */
  onlyIfUnset: z.boolean().default(false),
});

type UpdateSettingsInput = z.input<typeof updateSettingsInput>;

export { type UpdateSettingsInput, updateSettingsInput };
