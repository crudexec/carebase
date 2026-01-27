import useSWRMutation from "swr/mutation";

import { createRequest, deleteRequest } from "@/lib";

export const useUploadSignature = <T>(url: string) => {
  return useSWRMutation(
    `/api/${url}`,
    async (url: string, { arg }: { arg: T }) => await createRequest(url, arg),
  );
};

export const useClearSignature = () => {
  return useSWRMutation(
    "/api/misc/media",
    async (url: string, { arg }: { arg: { mediaId?: string } }) =>
      await deleteRequest(url, arg),
  );
};
