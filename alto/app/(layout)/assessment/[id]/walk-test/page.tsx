"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import WalkTest from "@/components/assessment/pt-eval/walk-test";
import { SNNoteHeader } from "@/components/evv";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { ObjectData, PageProps, PatientResponse } from "@/types";

const WalkTestPage = ({ params: { id } }: PageProps) => {
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">Walk Test Instructions</p>
      <AppLoader loading={isFetching || isLoading} />
      <div className="border p-4 rounded flex flex-col">
        <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
        <WalkTest
          patientScheduleId={id}
          mutate={mutate}
          data={modifyDateFields({
            ...parseData(data?.data?.walkTest),
            distance: parseData(data?.data?.walkTest)?.distance?.map(
              (item: ObjectData) => modifyDateFields(item),
            ),
          })}
          assessmentId={data?.data?.id as string}
          is3minWalkTest
        />
      </div>
    </div>
  );
};

export default WalkTestPage;
