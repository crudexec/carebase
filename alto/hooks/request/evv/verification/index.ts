import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import { createReqQuery, createRequest, updateRequest } from "@/lib";
import { AdmissionForm, VisitVerificationForm } from "@/schema";
import { ApiResponse, ScheduleVerificationResponse } from "@/types";

export const useGetVerificationDetails = ({
  scheduleId,
}: {
  scheduleId: string;
}) => {
  const queryData = createReqQuery({
    scheduleId,
  });
  return useSWR<
    ApiResponse<{
      evv: ScheduleVerificationResponse & { patientSignature?: string };
    }>
  >(`/api/evv?${queryData}`);
};

export const useSaveVisitVerification = () => {
  return useSWRMutation(
    "/api/evv",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<
          VisitVerificationForm & {
            patientScheduleId: string;
            id?: string;
            mediaId?: string;
          }
        >;
      },
    ) => await createRequest(url, arg),
  );
};

export const useUploadPatientSignature = () => {
  return useSWRMutation(
    "/api/evv/patient-signature",
    async (
      url: string,
      {
        arg,
      }: { arg: { patientScheduleId: string; id?: string; mediaId?: string } },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateAdmission = async (
  url: string,
  { arg }: { arg: AdmissionForm & { id?: string } },
) => {
  return await updateRequest(url, arg);
};
