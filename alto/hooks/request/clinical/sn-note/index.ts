import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { deleteRequest } from "@/lib";
import {
  ApiResponse,
  DeletePayload,
  SkilledNursingNoteResponse,
} from "@/types";

export const useGetSkilledNursingNotes = ({
  patientId,
  status,
}: { patientId?: string; status?: string } = {}) => {
  return useSWR<
    ApiResponse<{ snNotes: SkilledNursingNoteResponse[]; totalCount: number }>
  >(
    patientId
      ? `/api/clinical/sn-note?patientId=${patientId}&status=${status}`
      : null,
  );
};

export const useGetSkilledNursingNote = ({
  skilledNursingNoteId,
}: { skilledNursingNoteId?: string } = {}) => {
  return useSWR<ApiResponse<SkilledNursingNoteResponse>>(
    skilledNursingNoteId
      ? `/api/clinical/sn-note/${skilledNursingNoteId}`
      : null,
  );
};

export const useArchiveorActivateSnNote = () => {
  return useSWRMutation(
    `/api/clinical/sn-note`,
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
