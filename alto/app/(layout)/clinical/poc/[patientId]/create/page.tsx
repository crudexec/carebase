"use client";
import { User } from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import {
  ClinicalSummary,
  FunctionalLimits,
  Main,
  Medication,
  OrdersAndGoals,
  PlanOfCareDME,
  POCPhysician,
  QaSignature,
} from "@/components/clinical";
import DiagnosesProcedure from "@/components/clinical/diagnoses-procedure/diagnoses";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  useArchivePocDiagnosisProcedure,
  useCreatePocDiagnosisProcedure,
  useGetPatient,
  useGetPlanOfCare,
  useQueryParams,
  useUpdatePocDiagnosisProcedure,
} from "@/hooks";
import { PageProps, PatientResponse, PlanOfCareResponse } from "@/types";

const CreatePlanOfCare = ({
  params: { patientId },
  searchParams,
}: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", { defaultValue: "main" });
  const [planOfCareId, setPlanOfCareId] = useQueryParams("planOfCareId", {
    defaultValue: "",
  });

  const { data, isLoading, mutate } = useGetPlanOfCare({ planOfCareId });
  const {
    data: patientData,
    isLoading: loading,
    mutate: refetch,
  } = useGetPatient({ id: patientId as string });
  const { authUser } = useAuth();

  const {
    data: archiveResponse,
    isMutating: isArchiving,
    trigger: archivePocDiagnosisProcedure,
  } = useArchivePocDiagnosisProcedure();
  const {
    data: createResponse,
    trigger,
    isMutating,
  } = useCreatePocDiagnosisProcedure();
  const {
    data: updateResponse,
    trigger: updateDiagnosisProcedure,
    isMutating: isUpdating,
  } = useUpdatePocDiagnosisProcedure();

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">POC Plus</p>
      <SegmentedControl
        data={[
          { value: "main", label: "Main" },
          { value: "diagnosis", label: "Diagnoses & Proc" },
          { value: "medication", label: "Medications" },
          { value: "dme", label: "DME/Safe/Nutr/Alle" },
          { value: "func", label: "Func/Acti/Ment/Prog" },
          { value: "order", label: "Order & Goals" },
          { value: "clinical-summary", label: "Clinical Summary" },
          { value: "physician", label: "Physician/Nurse" },
          { value: "signature", label: "QA/Signature" },
        ]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isLoading || loading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientData?.data as PatientResponse} />
          <TabsContent value="main">
            <Main
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="diagnosis">
            {["diagnosis", "procedure"].map((scope) => (
              <DiagnosesProcedure
                scope={scope as "diagnosis" | "procedure"}
                callback={(res) => {
                  setPlanOfCareId(res);
                  mutate();
                }}
                patientId={patientData?.data?.id as string}
                parentId={planOfCareId as string}
                isMutating={isMutating || isUpdating}
                isArchiving={isArchiving}
                disabled={searchParams?.action === "view"}
                mutate={mutate}
                archiveResponse={archiveResponse}
                createResponse={createResponse}
                updateResponse={updateResponse}
                archiveCallback={archivePocDiagnosisProcedure}
                createCallback={trigger}
                updateCallback={updateDiagnosisProcedure}
                key={scope}
                url="clinical/poc/diagnosis-procedure"
              />
            ))}
          </TabsContent>
          <TabsContent value="medication">
            <Medication
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="dme">
            <PlanOfCareDME
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="func">
            <FunctionalLimits
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="order">
            <OrdersAndGoals
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="clinical-summary">
            <ClinicalSummary
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="physician">
            <POCPhysician
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="signature">
            <QaSignature
              data={data?.data as PlanOfCareResponse}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setPlanOfCareId(res);
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

export default CreatePlanOfCare;
