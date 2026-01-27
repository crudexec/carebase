import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { QASignatureForm } from "@/schema";

export const useSaveQASignature = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/qa-signature",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          QASignatureForm & {
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
