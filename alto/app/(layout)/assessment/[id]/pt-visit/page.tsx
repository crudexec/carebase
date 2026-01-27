"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import CareCoordination from "@/components/assessment/pt-visit/care-coordination";
import History from "@/components/assessment/pt-visit/history";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { PageProps, PatientResponse } from "@/types";

const tabList = [
  { value: "history", label: "History" },
  { value: "care-coordination", label: "Care Coordination" },
];

const PTVisit = ({ params: { id } }: PageProps) => {
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
      <p className="text-xl font-semibold pb-2">
        Physical Therapy Progress Note
      </p>
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
              data={modifyDateFields(parseData(data?.data?.ptVisit)?.history)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="care-coordination">
            <CareCoordination
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.ptVisit)?.careCoordination,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptVisit)}
              visitDate={data?.data?.visitDate as Date}
              timeIn={data?.data?.timeIn as string}
              timeOut={data?.data?.timeOut as string}
              isQA={isQA}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default PTVisit;
