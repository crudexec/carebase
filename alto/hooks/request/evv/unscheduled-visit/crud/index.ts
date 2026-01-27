import { UnscheduledVisit } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {} from "@/hooks";
import { createRequest } from "@/lib";
import { UnscheduledVisitForm } from "@/schema";
import { ApiResponse, UnscheduledVisitResponse } from "@/types";

type UnscheduledVisitPayload = {
  patientId: string;
  id?: string;
  startTime?: Date;
  endTime?: Date;
  dateAssessmentCompleted: Date;
  assessment: string;
  caregiverId: string;
};

export const useGetUnScheduledVisits = (caregiverId: string) => {
  return useSWR<ApiResponse<UnscheduledVisitResponse[]>>(
    caregiverId
      ? `/api/evv/unscheduled-visit?caregiverId=${caregiverId}`
      : null,
  );
};

export const useGetUnScheduledVisitDetailsById = ({ id }: { id: string }) => {
  return useSWR<
    ApiResponse<
      UnscheduledVisitResponse & {
        patientSignatureUrl?: string;
        caregiverSignatureUrl?: string;
      }
    >
  >(id ? `/api/evv/unscheduled-visit/${id}` : null);
};
export const useGetUnScheduledVisitDetails = ({
  patientId,
}: {
  patientId: string;
}) => {
  return useSWR<
    ApiResponse<
      UnscheduledVisitResponse & {
        patientSignatureUrl?: string;
        caregiverSignatureUrl?: string;
      }
    >
  >(
    patientId ? `/api/evv/unscheduled-visit/${patientId}?byPatient=true` : null,
  );
};

export const useGetUnScheduledVisitDetailById = ({ id }: { id: string }) => {
  return useSWR<
    ApiResponse<
      UnscheduledVisit & {
        patientSignatureUrl?: string;
        caregiverSignatureUrl?: string;
      }
    >
  >(`/api/evv/unscheduled-visit/${id}`);
};

export const useSaveUnscheduledVisitDetails = () => {
  return useSWRMutation(
    "/api/evv/unscheduled-visit",
    async (
      url: string,
      { arg }: { arg: Partial<UnscheduledVisitForm & UnscheduledVisitPayload> },
    ) => await createRequest(url, arg),
  );
};

export const useUpdateNoteType = () => {
  return useSWRMutation(
    "/api/evv/unscheduled-visit",
    async (
      url: string,
      { arg }: { arg: Partial<UnscheduledVisitForm & UnscheduledVisitPayload> },
    ) => await createRequest(url, arg),
  );
};
