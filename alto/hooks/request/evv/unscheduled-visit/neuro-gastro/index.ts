import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { NeuroGastroForm } from "@/schema";

export const useSaveNeuroGastro = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/neuro-gastro",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          NeuroGastroForm & {
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
