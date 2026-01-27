"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import BergBalance from "@/components/assessment/pt-eval/berg-balance";
import Functional from "@/components/assessment/pt-eval/functional";
import Hcpcs from "@/components/assessment/pt-eval/hcpcs";
import History from "@/components/assessment/pt-eval/history";
import Order from "@/components/assessment/pt-eval/order";
import Physical from "@/components/assessment/pt-eval/physical";
import TimedUp from "@/components/assessment/pt-eval/timed-up";
import Tinetti from "@/components/assessment/pt-eval/tinetti";
import Treatment from "@/components/assessment/pt-eval/treatment";
import WalkTest from "@/components/assessment/pt-eval/walk-test";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { ObjectData, PageProps, PatientResponse } from "@/types";

const tabList = [
  { value: "hcpcs", label: "HCPCS" },
  { value: "history", label: "History" },
  { value: "treatment", label: "Treatment" },
  { value: "physical", label: "Physical" },
  { value: "functional", label: "Functional" },
  { value: "order", label: "Order, Goal & Interventions" },
  { value: "berg-balance", label: "Berg Balance" },
  { value: "timed-up", label: "Timed Up & Go" },
  { value: "walk-test", label: "3 Min Walk Test" },
  { value: "tinetti", label: "Tinetti" },
];

const PTEval = ({ params: { id } }: PageProps) => {
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
      <p className="text-xl font-semibold pb-2">PT Eval </p>
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
              data={modifyDateFields(parseData(data?.data?.ptEval)?.hcpcs)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="history">
            <History
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.ptEval)?.history)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="treatment">
            <Treatment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.ptEval)?.treatment)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="functional">
            <Functional
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.ptEval)?.functional)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="berg-balance">
            <BergBalance
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.ptEval)?.bergBalance,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="timed-up">
            <TimedUp
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields({
                ...parseData(data?.data?.ptEval)?.timedUp,
                tug: parseData(data?.data?.ptEval)?.timedUp?.tug?.map(
                  (item: ObjectData) => modifyDateFields(item),
                ),
              })}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="walk-test">
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
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="order">
            <Order
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields({
                ...parseData(data?.data?.ptEval)?.order,
                goalIntervention: parseData(
                  data?.data?.ptEval,
                )?.order?.goalIntervention?.map((item: ObjectData) =>
                  modifyDateFields(item),
                ),
              })}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="tinetti">
            <Tinetti
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.ptEval)?.tinetti)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              visitDate={data?.data?.visitDate as Date}
              timeIn={data?.data?.timeIn as string}
              timeOut={data?.data?.timeOut as string}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="physical">
            <Physical
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.ptEval)?.physical)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.ptEval)}
              isQA={isQA}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default PTEval;
