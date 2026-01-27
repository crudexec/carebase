import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { IntervInstForm } from "@/schema";

export const useSaveIntervInst = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/interv-inst",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          IntervInstForm & {
            unscheduledVisitId?: string;
            skilledNursingNoteId?: string;
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
