import { DiagnosisProcedure, Discipline, Payer, Phrase } from "@prisma/client";
import useSWR from "swr";

import {} from "@/hooks";
import { createReqQuery } from "@/lib";
import { ApiResponse } from "@/types";

export const useGetDisciplines = () => {
  return useSWR<ApiResponse<Discipline[]>>(`/api/lookup/discipline`);
};
export const useGetPayers = ({
  inactivePayer,
}: {
  inactivePayer?: boolean;
}) => {
  const queryData = createReqQuery({ inactivePayer });
  return useSWR<ApiResponse<Payer[]>>(`/api/lookup/payer?${queryData}`);
};

export const useGetPhrases = (section: string) => {
  return useSWR<ApiResponse<Phrase[]>>(`/api/lookup/phrase?section=${section}`);
};

export const useGetDiagnosesAndProcedure = (scope: string) => {
  return useSWR<ApiResponse<DiagnosisProcedure[]>>(
    scope ? `/api/lookup/diagnosis-procedure?scope=${scope}` : null,
  );
};
