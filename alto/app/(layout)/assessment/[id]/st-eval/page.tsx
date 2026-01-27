"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import Evaluation from "@/components/assessment/st-eval/evaluation";
import History from "@/components/assessment/st-eval/history";
import Information from "@/components/assessment/st-eval/information";
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
  { value: "information", label: "Information" },
  { value: "history", label: "History" },
  { value: "evaluation", label: "Evaluation" },
];

const STEval = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "information",
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
      <p className="text-xl font-semibold pb-2">ST Eval </p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="information">
            <Information
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields({
                ...parseData(data?.data?.stEval)?.information,
                ...(!data?.data?.id && {
                  ...patientDetails?.data,
                  patientName: getFullName(
                    patientDetails?.data?.lastName,
                    patientDetails?.data?.firstName,
                  ),
                }),
              })}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.stEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="history">
            <History
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.stEval)?.history)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.stEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="evaluation">
            <Evaluation
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.stEval)?.evaluation)}
              assessmentId={data?.data?.id as string}
              visitDate={data?.data?.visitDate as Date}
              timeIn={data?.data?.timeIn as string}
              timeOut={data?.data?.timeOut as string}
              assessment={parseData(data?.data?.stEval)}
              isQA={isQA}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default STEval;
