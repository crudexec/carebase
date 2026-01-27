import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { InterventionForm } from "@/schema";

export const useCreateIntervention = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/intervention",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          InterventionForm & {
            unscheduledVisitId?: string;
            id?: string;
            patientId: string;
            caregiverId: string;
            snNoteType: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};
