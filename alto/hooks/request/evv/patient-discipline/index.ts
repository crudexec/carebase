import { PatientDiscipline } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import { createReqQuery, createRequest } from "@/lib";
import { DisciplineForm } from "@/schema";
import { ApiResponse } from "@/types";

export const useGetDiscipline = ({ id }: { id?: string }) => {
  const queryData = createReqQuery({
    id,
  });
  return useSWR<ApiResponse<{ discipline: PatientDiscipline }>>(
    `/api/evv/patient-discipline?${queryData}`,
  );
};

export const useSaveDiscipline = () => {
  return useSWRMutation(
    "/api/evv/patient-discipline",
    async (
      url: string,
      {
        arg,
      }: { arg: Partial<DisciplineForm & { patientId?: string; id?: string }> },
    ) => await createRequest(url, arg),
  );
};
