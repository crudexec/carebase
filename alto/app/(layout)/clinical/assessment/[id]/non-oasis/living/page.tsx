"use client";
import { User } from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import FamilySupportive from "@/components/clinical/assessment/non-oasis/living/living-financial/family-supportive";
import FinancialTab from "@/components/clinical/assessment/non-oasis/living/living-financial/financial";
import SafetyCare from "@/components/clinical/assessment/non-oasis/living/living-financial/safety-care";
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

const LivingFamily = ({ params: { id }, searchParams }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "family-supportive",
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
          { value: "family-supportive", label: "Family Supportive" },
          { value: "safety-care", label: "Safety Care Plan/Orders" },
          { value: "financial", label: "Financial" },
        ]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={loading || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientData?.data as PatientResponse} />
          <TabsContent value="family-supportive">
            <FamilySupportive
              data={modifyDateFields(
                parseData(data?.data?.livingFinancial)?.familySupport,
              )}
              livingFinancial={parseData(data?.data?.livingFinancial)}
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
          <TabsContent value="safety-care">
            <SafetyCare
              data={modifyDateFields(
                parseData(data?.data?.livingFinancial)?.safetyCare,
              )}
              livingFinancial={parseData(data?.data?.livingFinancial)}
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
          <TabsContent value="financial">
            <FinancialTab
              data={modifyDateFields(
                parseData(data?.data?.livingFinancial)?.financial,
              )}
              livingFinancial={parseData(data?.data?.livingFinancial)}
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
        </div>
      </SegmentedControl>
    </div>
  );
};

export default LivingFamily;
