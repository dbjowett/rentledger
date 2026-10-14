import { api } from '@/lib/api';
import type {
  CreatePropertyInput,
  CreatePropertyResponse,
  PropertyResponse,
  PropertySummaryResponse,
} from '@/shared/types';

const propertyKeys = {
  all: ['properties'] as const,
  list: () => [...propertyKeys.all, 'list'] as const,
  detail: (id: string) => [...propertyKeys.all, 'detail', id] as const,
};

const propertyApi = {
  list: async () => api<PropertySummaryResponse[]>('/api/properties'),
  get: async (id: string) => api<PropertyResponse>(`/api/properties/${encodeURIComponent(id)}`),
  create: async (input: CreatePropertyInput) =>
    api<CreatePropertyResponse>('/api/properties', { method: 'POST', body: input }),
};

export { propertyApi, propertyKeys };
