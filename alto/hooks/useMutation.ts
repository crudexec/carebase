import { useEffect } from "react";
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import { ApiResponse } from "@/types";

type Props<T> = {
  data?: ApiResponse<T>;
  message?: string;
  onSuccess?: () => void;
  onError?: () => void;
  noToast?: boolean;
};

export const useMutation = <Payload = unknown, Response = unknown>(
  url: string,
  mutateFn: (url: string, payload: Payload) => Promise<ApiResponse<Response>>,
  prop?: Props<Response>,
) => {
  const { data, isMutating, trigger, error } = useSWRMutation<
    ApiResponse<Response>,
    Error,
    string,
    Payload
  >(url, async (url, { arg }) => await mutateFn(url, arg));

  useEffect(() => {
    if (data?.success) {
      prop?.onSuccess?.();

      if ((data?.message || prop?.message) && !prop?.noToast) {
        toast.success(prop?.message ?? data?.message);
      }
    }
    if (error) {
      prop?.onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, prop?.noToast]);

  return { data, isMutating, trigger };
};
