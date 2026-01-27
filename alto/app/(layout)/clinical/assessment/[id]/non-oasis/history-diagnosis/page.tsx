"use client";
import { User } from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import DiagnosisCodes from "@/components/clinical/assessment/non-oasis/diagnoses-procedure";
import HospitalProgram from "@/components/clinical/assessment/non-oasis/history-diagnosis/hosp-prog";
import MedicalHistory from "@/components/clinical/assessment/non-oasis/history-diagnosis/med-hist";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  useGetClinicalAssessment,
  useGetPatient,
  useQueryParams,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import { PageProps, PatientResponse } from "@/types";

const HistoryDiagnosis = ({ params: { id }, searchParams }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "med-hist",
  });
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
      <SegmentedControl
        data={[
          { value: "med-hist", label: "Med Hist." },
          { value: "hosp", label: "Hosp, Prog, Immu." },
          { value: "diagnosis", label: "Diagnosis & Procedure" },
        ]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isLoading || loading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientData?.data as PatientResponse} />
          <TabsContent value="med-hist">
            <MedicalHistory
              data={modifyDateFields(
                parseData(data?.data?.historyAndDiagnosis)?.medHistoryData,
              )}
              historyAndDiagnosis={parseData(data?.data?.historyAndDiagnosis)}
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
            />
          </TabsContent>
          <TabsContent value="hosp">
            <HospitalProgram
              data={modifyDateFields(
                parseData(data?.data?.historyAndDiagnosis)?.hospData,
              )}
              historyAndDiagnosis={parseData(data?.data?.historyAndDiagnosis)}
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
            />
          </TabsContent>
          <TabsContent value="diagnosis">
            <DiagnosisCodes
              diagnosis={
                parseData(data?.data?.historyAndDiagnosis)?.diagnosis ?? []
              }
              procedure={
                parseData(data?.data?.historyAndDiagnosis)?.procedure ?? []
              }
              historyAndDiagnosis={parseData(data?.data?.historyAndDiagnosis)}
              dateCompleted={dateCompleted ?? data?.data?.dateCompleted}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              assessmentId={assessmentId}
              callback={(res) => {
                setAssessmentId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default HistoryDiagnosis;
