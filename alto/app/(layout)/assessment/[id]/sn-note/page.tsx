"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import Billing from "@/components/assessment/sn-note/billing";
import CarePlan from "@/components/assessment/sn-note/careplan";
import DigestiveNutrition from "@/components/assessment/sn-note/digestive-nutrition";
import GeneralInformation from "@/components/assessment/sn-note/general-information";
import Observation from "@/components/assessment/sn-note/observation-one";
import Observation2 from "@/components/assessment/sn-note/observation-two";
import SkilledIntervention from "@/components/assessment/sn-note/skilled-intervention";
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
  { value: "billing", label: "Billing" },
  { value: "general-information", label: "General Information" },
  { value: "observation-1", label: "Observation (PART 1)" },
  { value: "observation-2", label: "Observation (PART 2)" },
  { value: "digestive-nutrition", label: "Digestive Nutrition" },
  { value: "skilled-intervention", label: "Skilled Intervention" },
  { value: "careplan", label: "Careplan and Coordination" },
];

const SnVisit = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "billing",
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
      <p className="text-xl font-semibold pb-2">SN Visit Note</p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="billing">
            <Billing
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.snVisit)?.billing)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="general-information">
            <GeneralInformation
              data={modifyDateFields(patientDetails?.data as PatientResponse)}
            />
          </TabsContent>
          <TabsContent value="digestive-nutrition">
            <DigestiveNutrition
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.snVisit)?.digestiveNutrition,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="observation-1">
            <Observation
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.snVisit)?.observation1,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="observation-2">
            <Observation2
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.snVisit)?.observation2,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="skilled-intervention">
            <SkilledIntervention
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.snVisit)?.skilledIntervention,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="careplan">
            <CarePlan
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(parseData(data?.data?.snVisit)?.carePlan)}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.snVisit)}
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

export default SnVisit;
