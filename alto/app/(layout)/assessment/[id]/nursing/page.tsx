"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import BodyAssessment from "@/components/assessment/nursing/body-assessment";
import Cert485 from "@/components/assessment/nursing/cert485";
import DiagnosisCodes from "@/components/assessment/nursing/diagnoses-procedure";
import InternalAssessment from "@/components/assessment/nursing/internal-assessment";
import LivingAssessment from "@/components/assessment/nursing/living-assessment";
import PatientHistory from "@/components/assessment/nursing/patient-history";
import PsychoSocial from "@/components/assessment/nursing/psychosocial";
import RehabGoals from "@/components/assessment/nursing/rehab-goals";
import Services from "@/components/assessment/nursing/services";
import SkilledObservation from "@/components/assessment/nursing/skilled-observation";
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
  { value: "patient-history", label: "Patient History" },
  { value: "diagnosis-codes", label: "Diagnosis Codes" },
  { value: "skilled-observation", label: "Skilled Observation" },
  { value: "internal-assessment", label: "Internal Assessment" },
  { value: "psychosocial", label: "Psychosocial" },
  { value: "body-assessment", label: "Body Assessment" },
  { value: "living-assessment", label: "Living Assessment" },
  { value: "services", label: "Services" },
  { value: "rehab-goals", label: "Rehab Goals" },
  { value: "485", label: "485" },
];

const NursingAssessment = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "patient-history",
  });
  const [isQA] = useQueryParams("isQA", { defaultValue: "" });
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">Nursing Assessment </p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="patient-history">
            <PatientHistory
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.patientHistory,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="internal-assessment">
            <InternalAssessment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.internalAssessment,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="diagnosis-codes">
            <DiagnosisCodes
              patientScheduleId={id}
              mutate={mutate}
              diagnosis={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.diagnosis,
              )}
              procedure={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.procedure,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="psychosocial">
            <PsychoSocial
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.psychosocial,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="body-assessment">
            <BodyAssessment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.bodyAssessment,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="skilled-observation">
            <SkilledObservation
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.skilledObservation,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="living-assessment">
            <LivingAssessment
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.livingAssessment,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="rehab-goals">
            <RehabGoals
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.rehabGoals,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="services">
            <Services
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.services,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="485">
            <Cert485
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.nursingAssessment)?.cert485,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.nursingAssessment)}
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

export default NursingAssessment;
