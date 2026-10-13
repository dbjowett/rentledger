import { useQuery, type QueryClient } from '@tanstack/react-query';

import { useOptimisticMutation } from '@/lib/hooks/useOptimisticMutation';
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

export { storeSettings, useMe, useTimeZones, useUpdateSettings };
