import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { GenitoEndoForm } from "@/schema";

export const useSaveGenitoEndo = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/genito-endo",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          GenitoEndoForm & {
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
