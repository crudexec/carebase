import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { NotePlanForm } from "@/schema";

export const useSaveNotePlan = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/note-plan",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          NotePlanForm & {
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
