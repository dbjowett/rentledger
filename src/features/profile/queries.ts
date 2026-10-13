import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { UpdateSettingsInput } from '@/shared/schemas';
import type { Me, TimeZoneOption, UpdateSettingsResult } from '@/shared/types';

const meKey = ['me'] as const;
const timeZonesKey = ['time-zones'] as const;

async function updateSettings(input: UpdateSettingsInput) {
  return api<UpdateSettingsResult>('/api/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

function storeSettings(queryClient: QueryClient, result: UpdateSettingsResult) {
  queryClient.setQueryData<Me>(meKey, (me) =>
    me === undefined ? me : { ...me, settings: result.settings },
  );
}

function useMe() {
  return useQuery({ queryKey: meKey, queryFn: async () => api<Me>('/api/me') });
}

function useTimeZones() {
  return useQuery({
    queryKey: timeZonesKey,
    queryFn: async () => api<TimeZoneOption[]>('/api/time-zones'),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (result) => storeSettings(queryClient, result),
  });
}

export { storeSettings, updateSettings, useMe, useTimeZones, useUpdateSettings };
