import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { CardioPulmForm } from "@/schema";

export const useSaveCardioPulm = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/cardio-pulm",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          CardioPulmForm & {
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
