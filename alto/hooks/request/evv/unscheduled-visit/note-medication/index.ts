import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { NoteMedicationForm } from "@/schema";

export const useSaveNoteMedication = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/note-medication",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          NoteMedicationForm & {
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
