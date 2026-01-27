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
import React, { useState } from "react";

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
import { useGetUnScheduledVisitDetailsById } from "@/hooks";
import { useGetSkilledNursingNote } from "@/hooks/request/clinical/sn-note";
import { PageProps, PatientResponse } from "@/types";

const SnNote = ({ params: { id }, searchParams }: PageProps) => {
  const [formTab, setFormTab] = useState("vital-signs");
  const {
    data: unscheduledVisit,
    isLoading: loading,
    mutate: refresh,
  } = useGetUnScheduledVisitDetailsById({ id: id });
  const { data, isLoading, mutate } = useGetSkilledNursingNote({
    skilledNursingNoteId: unscheduledVisit?.data?.skilledNursingNote
      ?.id as string,
  });
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
          <SNNoteHeader
            patient={unscheduledVisit?.data?.patient as PatientResponse}
          />
          <TabsContent value="vital-signs">
            <VitalSignsForm
              data={data?.data?.vitalSigns as VitalSigns}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="cardio-pulm">
            <CardioPulm
              data={data?.data?.cardioPulm as CardioPulmonary}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="neuro-gastro">
            <NeuroGastro
              data={data?.data?.neuroGastro as NeuroGastroClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="genito-endo">
            <GenitoEndo
              data={data?.data?.genitoEndo as GenitoEndoClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="medication">
            <NoteMedication
              data={data?.data?.noteMedication as NoteMedicationClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="plan">
            <NotePlan
              data={data?.data?.notePlan as NotePlanClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="signature">
            <QASignature
              data={data?.data?.qASignature as QASignatureClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="skin-wound">
            <SkinAndWound
              data={data?.data?.skinAndWound as SkinAndWoundClient}
              caregiver={unscheduledVisit?.data?.caregiver as User}
              unscheduledVisitId={id}
              patientId={unscheduledVisit?.data?.patientId as string}
              snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
              callback={() => {
                refresh();
                mutate();
              }}
            />
          </TabsContent>
          <TabsContent value="interv">
            {searchParams?.type === "poc" ? (
              <Intervention
                data={data?.data?.noteIntervention as NoteIntervention[]}
                caregiver={unscheduledVisit?.data?.caregiver as User}
                unscheduledVisitId={id}
                patientId={unscheduledVisit?.data?.patientId as string}
                snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
                callback={() => {
                  refresh();
                  mutate();
                }}
              />
            ) : (
              <IntervInst
                data={data?.data?.noteIntervInst as NoteIntervInst}
                caregiver={unscheduledVisit?.data?.caregiver as User}
                unscheduledVisitId={id}
                patientId={unscheduledVisit?.data?.patientId as string}
                snNoteType={searchParams?.type === "poc" ? "poc" : "skilled"}
                callback={() => {
                  refresh();
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

export default SnNote;
