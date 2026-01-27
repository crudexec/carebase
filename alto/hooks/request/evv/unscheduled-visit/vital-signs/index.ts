import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { VitalSignsFormType } from "@/schema";

export const useSaveVitalSigns = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/vital-signs",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          VitalSignsFormType & {
            unscheduledVisitId?: string;
            id?: string;
            patientId: string;
            caregiverId: string;
            snNoteType: string;
            skilledNursingNoteId?: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};
