"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import Hcpcs from "@/components/assessment/ot-eval/hcpcs";
import History from "@/components/assessment/ot-eval/history";
import Physical from "@/components/assessment/ot-eval/physical";
import Treatment from "@/components/assessment/ot-eval/treatment";
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
  { value: "hcpcs", label: "HCPCS" },
  { value: "history", label: "History" },
  { value: "treatment", label: "Treatment" },
  { value: "physical", label: "Physical" },
];

const OTEval = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "hcpcs",
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
      <p className="text-xl font-semibold pb-2">OT Eval</p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="hcpcs">
            <Hcpcs
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.otEval)?.hcpcs)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.otEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="history">
            <History
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.otEval)?.history)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.otEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="treatment">
            <Treatment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.otEval)?.treatment)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.otEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="physical">
            <Physical
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.otEval)?.physical)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.otEval)}
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

export default OTEval;
