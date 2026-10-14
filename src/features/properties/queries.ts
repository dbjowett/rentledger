import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { propertyApi, propertyKeys } from './api';

function useProperties() {
  return useQuery({ queryKey: propertyKeys.list(), queryFn: propertyApi.list });
}

function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: async () => propertyApi.get(id),
  });
}

/** Creates a property with its units; refreshes every property query afterwards. */
function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyApi.create,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export { useCreateProperty, useProperties, useProperty };
