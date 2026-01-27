"use client";
import { User } from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import { Reason } from "@/components/clinical";
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

const CreateOasis = ({ params: { id }, searchParams }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "reason",
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
      <p className="text-xl font-semibold pb-2">OASIS E</p>
      <SegmentedControl
        data={[{ value: "reason", label: "Reason" }]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isLoading || loading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientData?.data as PatientResponse} />
          <TabsContent value="reason">
            <Reason
              data={modifyDateFields(parseData(data?.data?.oasisAssessment))}
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
              reasons={data?.data?.reasons ?? []}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default CreateOasis;
