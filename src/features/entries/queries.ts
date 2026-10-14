import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { EntryKind } from '@/shared/schemas';

import { propertyKeys } from '../properties/api';
import { entryApi, entryKeys } from './api';

const CATEGORY_STALE_MS = 5 * 60 * 1000;

function useCategories(kind: EntryKind) {
  return useQuery({
    queryKey: entryKeys.categories(kind),
    queryFn: async () => entryApi.categories(kind),
    staleTime: CATEGORY_STALE_MS,
  });
}

/** Saves an entry; refreshes entries, property totals and category usage afterwards. */
function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entryApi.create,
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: entryKeys.transactions }),
        queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]),
  });
}

export { useCategories, useCreateTransaction };
