import { api } from '@/lib/api';
import type {
  MeResponse,
  TimeZoneOption,
  UpdateSettingsInput,
  UpdateSettingsResponse,
} from '@/shared/types';

const profileKeys = {
  me: ['me'] as const,
  timeZones: ['time-zones'] as const,
};

const profileApi = {
  me: async () => api<MeResponse>('/api/me'),
  timeZones: async () => api<TimeZoneOption[]>('/api/time-zones'),
  updateSettings: async (input: UpdateSettingsInput) =>
    api<UpdateSettingsResponse>('/api/me/settings', { method: 'PATCH', body: input }),
};

export { profileApi, profileKeys };
