"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Custom hook to execute a mutation function and invalidate query cache on success
const useCustomMutation = <T>(
  mutationFn: any, // Mutation function to be executed
  queryKeys: string[], // Array of query keys to be invalidated on success
  onSuccess?: () => void // Optional callback function to be executed on success
) => {
  // Accessing the query client from React Query
  const queryClient = useQueryClient();

  // Executing the mutation using useMutation hook
  const { ...props } = useMutation({
    // Wrapping the mutation function to accept parameters and pass them to the provided mutationFn
    mutationFn: (params?: T) => mutationFn(params),
    // Callback function to be executed on mutation success
    onSuccess: () => {
      // Executing the onSuccess callback function if provided
      if (onSuccess) {
        onSuccess();
      }

      // Invalidating queries with the specified query keys to update the cache
      queryClient.invalidateQueries({
        queryKey: queryKeys,
      });
    },
  });

  // Returning the mutation result props
  return { ...props };
};

export default useCustomMutation;
