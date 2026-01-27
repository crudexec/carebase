import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {
  createReqQuery,
  createRequest,
  deleteRequest,
  updateRequest,
} from "@/lib";
import { AppointmentForm } from "@/schema";
import { ApiResponse, DeletePayload, PatientScheduleResponse } from "@/types";

export const useGetSchedules = ({
  patient,
  caregiver,
  inactivePatient,
  inactiveCaregiver,
  visitStatus,
  office,
  billingCode,
  startDate,
  endDate,
  date,
  status,
}: {
  patient?: string;
  caregiver?: string;
  inactivePatient?: boolean;
  inactiveCaregiver?: boolean;
  visitStatus?: string;
  office?: string;
  billingCode?: string;
  startDate?: Date;
  endDate?: Date;
  date?: Date;
  status?: string;
}) => {
  const queryData = createReqQuery({
    patient,
    caregiver,
    inactivePatient,
    inactiveCaregiver,
    visitStatus,
    office,
    billingCode,
    startDate,
    endDate,
    status,
    date,
  });
  return useSWR<
    ApiResponse<{ schedules: PatientScheduleResponse[]; totalCount: number }>
  >(`/api/schedule?${queryData}`);
};

export const useGetSchedule = ({ id }: { id: string }) => {
  return useSWR<ApiResponse<{ patientSchedule: PatientScheduleResponse }>>(
    `/api/schedule/${id}`,
  );
};
export const useCreateSchedule = () => {
  return useSWRMutation(
    "/api/schedule",
    async (url: string, { arg }: { arg: Partial<AppointmentForm> }) =>
      await createRequest(url, arg),
  );
};

export const useUpdateSchedule = () => {
  return useSWRMutation(
    "/api/schedule",
    async (
      url: string,
      {
        arg,
      }: {
        arg: Partial<AppointmentForm & { recurrenceType: string }> & {
          id: string;
        };
      },
    ) => await updateRequest(url, arg),
  );
};

export const useDeleteSchedule = () => {
  return useSWRMutation(
    "/api/schedule",
    async (url: string, { arg }: { arg: DeletePayload }) =>
      await deleteRequest(url, arg),
  );
};
