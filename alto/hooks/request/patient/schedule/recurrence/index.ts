import useSWRMutation from "swr/mutation";

import { createRequest, updateRequest } from "@/lib";
import { RecurrenceForm } from "@/schema";

export const useCreateRecurrence = () => {
  return useSWRMutation(
    "/api/schedule/recurrence",
    async (url: string, { arg }: { arg: Partial<RecurrenceForm> }) =>
      await createRequest(url, arg),
  );
};

export const useUpdateRecurrence = () => {
  return useSWRMutation(
    "/api/schedule/recurrence",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<RecurrenceForm> & { id: string; recurrenceType?: string };
      },
    ) => await updateRequest(url, arg),
  );
};
