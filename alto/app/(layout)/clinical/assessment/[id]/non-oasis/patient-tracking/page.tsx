"use client";
import { User } from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import { PatientTracking } from "@/components/clinical";
import { SNNoteHeader } from "@/components/evv";
import { useAuth } from "@/context/AuthContext";
import {
  useGetClinicalAssessment,
  useGetPatient,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { PageProps, PatientResponse } from "@/types";

const CreatePatientTracking = ({ params: { id }, searchParams }: PageProps) => {
  const [assessmentId, setAssessmentId] = useQueryParams("assessmentId", {
    defaultValue: "",
  });
  const [dateCompleted] = useQueryParams("date", { defaultValue: null });
  const { data, isLoading, mutate } = useGetClinicalAssessment({
    id: assessmentId,
  });
  const {
    data: patientData,
    isLoading: loading,
    mutate: refetch,
  } = useGetPatient({ id });

  const { authUser } = useAuth();

  return (
    <div className="p-5">
      <AppLoader loading={isLoading || loading} />
      <div className="border p-4 rounded flex flex-col">
        <SNNoteHeader patient={patientData?.data as PatientResponse} />
        <PatientTracking
          data={modifyDateFields({
            ...parseData(data?.data?.patientTracking),
            ...(!assessmentId && { ...patientData?.data }),
          })}
          dateCompleted={dateCompleted ?? data?.data?.dateCompleted}
          caregiver={authUser as User}
          patientId={patientData?.data?.id as string}
          disabled={searchParams?.action === "view"}
          assessmentId={assessmentId}
          callback={(res) => {
            setAssessmentId(res);
            refetch();
            mutate();
          }}
          reasons={data?.data?.reasons ?? []}
        />
      </div>
    </div>
  );
};

export default CreatePatientTracking;
