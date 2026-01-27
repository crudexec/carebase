"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import CareCoordination from "@/components/assessment/st-visit/care-coordination";
import History from "@/components/assessment/st-visit/history";
import Treatment from "@/components/assessment/st-visit/treatment";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { getFullName, modifyDateFields, parseData } from "@/lib";
import { PageProps, PatientResponse } from "@/types";

const tabList = [
  { value: "history", label: "History" },
  { value: "treatment", label: "Treatment" },
  { value: "care-coordination", label: "Care Coordination" },
];

const STVisit = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "history",
  });
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });
  const [isQA] = useQueryParams("isQA", { defaultValue: "" });

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">ST/STA Visit </p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="history">
            <History
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields({
                ...parseData(data?.data?.stVisit)?.history,
                ...(!data?.data?.id && {
                  ...patientDetails?.data,
                  patientName: getFullName(
                    patientDetails?.data?.lastName,
                    patientDetails?.data?.firstName,
                  ),
                }),
              })}
              assessment={parseData(data?.data?.stVisit)}
              assessmentId={data?.data?.id as string}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="treatment">
            <Treatment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.stVisit)?.treatment)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.stVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="care-coordination">
            <CareCoordination
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.stVisit)?.careCoordination,
              )}
              assessmentId={data?.data?.id as string}
              visitDate={data?.data?.visitDate as Date}
              timeIn={data?.data?.timeIn as string}
              timeOut={data?.data?.timeOut as string}
              assessment={parseData(data?.data?.stVisit)}
              isQA={isQA}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default STVisit;
