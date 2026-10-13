import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { toast } from '@/components/ui';

type OptimisticMutationOptions<TData, TInput, TResult> = {
  /** The cached query the change shows up in. */
  queryKey: QueryKey;
  mutationFn: (input: TInput) => Promise<TResult>;
  /** Returns the cached data as it will look once the server accepts the change. */
  apply: (current: TData, input: TInput) => TData;
  errorMessage?: string;
};

/**
 * For edits, toggles and deletes: updates the cache instantly, rolls back with a toast if the
 * request fails, and refetches afterwards so the cache ends up matching the server.
 */
function useOptimisticMutation<TData, TInput, TResult>({
  queryKey,
  mutationFn,
  apply,
  errorMessage = "Couldn't save. Try again.",
}: OptimisticMutationOptions<TData, TInput, TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (input: TInput) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData>(queryKey);
      if (previous !== undefined) queryClient.setQueryData(queryKey, apply(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
      toast.show({ variant: 'neutral', message: errorMessage });
    },
    onSettled: async () => queryClient.invalidateQueries({ queryKey }),
  });
}

export { type OptimisticMutationOptions, useOptimisticMutation };
