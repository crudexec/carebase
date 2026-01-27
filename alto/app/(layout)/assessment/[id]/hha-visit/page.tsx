"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import Patient from "@/components/assessment/hha-visit/patient";
import { SNNoteHeader } from "@/components/evv";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { PageProps, PatientResponse } from "@/types";

const PTVisit = ({ params: { id } }: PageProps) => {
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });

  return (
    <div className="p-5">
      <AppLoader loading={isLoading || isFetching} />
      <p className="text-xl font-semibold pb-2">HHA Care Progress Notes</p>
      <div className="border p-4 rounded flex flex-col">
        <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
        <Patient
          patientScheduleId={id}
          mutate={mutate}
          data={modifyDateFields({
            ...parseData(data?.data?.hhaVisit)?.patient,
            ...(!data?.data?.id && { ...patientDetails?.data }),
          })}
          assessmentId={data?.data?.id as string}
        />
      </div>
    </div>
  );
};

export default PTVisit;
