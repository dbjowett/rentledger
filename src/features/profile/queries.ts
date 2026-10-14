import { useQuery, type QueryClient } from '@tanstack/react-query';

import { useOptimisticMutation } from '@/lib/hooks/useOptimisticMutation';
import { deviceTimeZone, isValidTimeZone } from '@/shared/timeZones';
import type { Me, UpdateSettingsResult } from '@/shared/types';

import { profileApi, profileKeys } from './api';

function storeSettings(queryClient: QueryClient, result: UpdateSettingsResult) {
  queryClient.setQueryData<Me>(profileKeys.me, (me) =>
    me === undefined ? me : { ...me, settings: result.settings },
  );
}

function useMe() {
  return useQuery({ queryKey: profileKeys.me, queryFn: profileApi.me });
}

/** Canadian Central Time: the middle of the country's zones, used only when nothing else is known. */
const FALLBACK_TIME_ZONE = 'America/Winnipeg';

/** The time zone dates are worked out in: the saved one if valid, else the phone's, else Central. */
function useUserTimeZone(): string {
  const saved = useMe().data?.settings.timeZone;
  if (saved != null && isValidTimeZone(saved)) return saved;
  return deviceTimeZone() ?? FALLBACK_TIME_ZONE;
}

function useTimeZones() {
  return useQuery({
    queryKey: profileKeys.timeZones,
    queryFn: profileApi.timeZones,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

function useUpdateSettings() {
  return useOptimisticMutation({
    queryKey: profileKeys.me,
    mutationFn: profileApi.updateSettings,
    apply: (me: Me, input) => ({ ...me, settings: { ...me.settings, timeZone: input.timeZone } }),
    errorMessage: "Couldn't save the time zone",
  });
}

export { storeSettings, useMe, useTimeZones, useUpdateSettings, useUserTimeZone };
