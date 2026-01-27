"use client";
import {
  CardioPulmonary,
  GenitoEndo as GenitoEndoClient,
  NeuroGastro as NeuroGastroClient,
  NoteIntervention,
  NoteIntervInst,
  NoteMedication as NoteMedicationClient,
  NotePlan as NotePlanClient,
  QASignature as QASignatureClient,
  SkinAndWound as SkinAndWoundClient,
  User,
  VitalSigns,
} from "@prisma/client";
import React from "react";

import AppLoader from "@/components/app-loader";
import {
  CardioPulm,
  GenitoEndo,
  Intervention,
  IntervInst,
  NeuroGastro,
  NoteMedication,
  NotePlan,
  QASignature,
  SkinAndWound,
  SNNoteHeader,
} from "@/components/evv";
import VitalSignsForm from "@/components/evv/sn-note/vital-signs";
import { SegmentedControl, TabsContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useGetPatient, useQueryParams } from "@/hooks";
import { useGetSkilledNursingNote } from "@/hooks/request/clinical/sn-note";
import { PageProps, PatientResponse } from "@/types";

const CreateSnNote = ({ params: { patientId }, searchParams }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "vital-signs",
  });
  const [skilledNursingNoteId, setSkilledNursingNoteId] = useQueryParams(
    "skilledNursingNoteId",
    { defaultValue: "" },
  );
  const { data, isLoading, mutate } = useGetSkilledNursingNote({
    skilledNursingNoteId,
  });
  const {
    data: patientData,
    isLoading: loading,
    mutate: refetch,
  } = useGetPatient({
    id: patientId as string,
  });
  const { authUser } = useAuth();

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">
        {searchParams?.type === "poc"
          ? "SN Note According to POC (SNaP)"
          : "Skilled Nursing Visit Note"}
      </p>
      <SegmentedControl
        data={[
          { value: "vital-signs", label: "Vital Signs" },
          { value: "cardio-pulm", label: "Cardio & Pulm" },
          { value: "neuro-gastro", label: "Neuro & Gastro" },
          { value: "genito-endo", label: "Genito & Endo" },
          { value: "skin-wound", label: "Skin & Wound" },
          { value: "medication", label: "Medication" },
          {
            value: "interv",
            label: searchParams?.type === "poc" ? "Interv." : "Interv & Inst.",
          },
          { value: "plan", label: "Plan" },
          { value: "signature", label: "QA/Signature" },
        ]}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isLoading || loading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientData?.data as PatientResponse} />
          <TabsContent value="vital-signs">
            <VitalSignsForm
              data={data?.data?.vitalSigns as VitalSigns}
              caregiver={authUser as User}
              patientId={patientData?.data?.id as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="cardio-pulm">
            <CardioPulm
              data={data?.data?.cardioPulm as CardioPulmonary}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="neuro-gastro">
            <NeuroGastro
              data={data?.data?.neuroGastro as NeuroGastroClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="genito-endo">
            <GenitoEndo
              data={data?.data?.genitoEndo as GenitoEndoClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="medication">
            <NoteMedication
              data={data?.data?.noteMedication as NoteMedicationClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="plan">
            <NotePlan
              data={data?.data?.notePlan as NotePlanClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="signature">
            <QASignature
              data={data?.data?.qASignature as QASignatureClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="skin-wound">
            <SkinAndWound
              data={data?.data?.skinAndWound as SkinAndWoundClient}
              caregiver={authUser as User}
              patientId={patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              skilledNursingNoteId={skilledNursingNoteId}
              disabled={searchParams?.action === "view"}
              callback={(res) => {
                setSkilledNursingNoteId(res);
                refetch();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="interv">
            {searchParams?.type === "poc" ? (
              <Intervention
                data={data?.data?.noteIntervention as NoteIntervention[]}
                caregiver={authUser as User}
                patientId={patientId as string}
                snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
                skilledNursingNoteId={skilledNursingNoteId}
                disabled={searchParams?.action === "view"}
                callback={(res) => {
                  setSkilledNursingNoteId(res);
                  refetch();
                  mutate();
                }}
              />
            ) : (
              <IntervInst
                data={data?.data?.noteIntervInst as NoteIntervInst}
                caregiver={authUser as User}
                patientId={patientId as string}
                snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
                skilledNursingNoteId={skilledNursingNoteId}
                disabled={searchParams?.action === "view"}
                callback={(res) => {
                  setSkilledNursingNoteId(res);
                  refetch();
                  mutate();
                }}
              />
            )}
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default CreateSnNote;
