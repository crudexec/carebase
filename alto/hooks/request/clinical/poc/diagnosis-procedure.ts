import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { PocDiagnosisProcedureForm } from "@/schema";
import {
  ApiResponse,
  DeletePayload,
  PocDiagnosisProcedureResponse,
} from "@/types";

export const useCreatePocDiagnosisProcedure = () => {
  return useSWRMutation(
    "/api/clinical/poc/diagnosis-procedure",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          PocDiagnosisProcedureForm & {
            id?: string;
            patientId: string;
            scope: string;
            caregiverId: string;
            planOfCareId: string;
            isCert485?: boolean;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};

export const useUpdatePocDiagnosisProcedure = () => {
  return useSWRMutation(
    "/api/clinical/poc/diagnosis-procedure",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          PocDiagnosisProcedureForm & { id?: string; scope: string }
        >;
      },
    ) => await updateRequest(url, arg),
  );
};

export const useGetPocDiagnosisProcedure = ({
  planOfCareId,
  status,
  scope,
}: {
  planOfCareId: string;
  status: string;
  scope: string;
}) => {
  const queryData = createReqQuery({ planOfCareId, status, scope });
  return useSWR<
    ApiResponse<{
      diagnosisProcedures: PocDiagnosisProcedureResponse[];
      totalCount: number;
    }>
  >(planOfCareId ? `/api/clinical/poc/diagnosis-procedure?${queryData}` : null);
};

export const useArchivePocDiagnosisProcedure = () => {
  return useSWRMutation(
    `/api/clinical/poc/diagnosis-procedure`,
    async (url: string, { arg }: { arg: DeletePayload & { scope: string } }) =>
      await deleteRequest(url, arg),
  );
};
