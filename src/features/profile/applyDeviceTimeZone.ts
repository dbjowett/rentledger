import { router } from 'expo-router';
import type { QueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui';
import { deviceTimeZone, timeZoneCity } from '@/shared/timeZones';

import { profileApi } from './api';
import { storeSettings } from './queries';

/** At sign-in: store the phone's time zone if the user has none yet. Never overwrites. */
async function applyDeviceTimeZone(queryClient: QueryClient) {
  const timeZone = deviceTimeZone();
  if (timeZone === null) return;

  try {
    const result = await profileApi.updateSettings({ timeZone, onlyIfUnset: true });
    storeSettings(queryClient, result);
    if (result.updated) {
      toast.show({
        message: `Using ${timeZoneCity(timeZone)} time for due dates`,
        action: { label: 'Change', onPress: () => router.push('/profile') },
      });
    }
  } catch {
    // Not fatal: the profile screen shows the time zone as not set and offers to fix it.
  }
}

export { applyDeviceTimeZone };
