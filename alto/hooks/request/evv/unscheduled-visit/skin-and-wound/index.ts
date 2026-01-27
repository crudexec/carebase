import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { SkinAndWoundForm } from "@/schema";

export const useSaveSkinAndWound = () => {
  return useSWRMutation(
    "/api/clinical/sn-note/skin-and-wound",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          SkinAndWoundForm & {
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
