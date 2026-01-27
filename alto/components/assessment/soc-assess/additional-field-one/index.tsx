"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PromptModal from "@/components/prompt-modal";
import { Button, Form, Textarea } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  additionalFieldOneDefaultValue,
  AdditionalFieldOneForm,
  additionalFieldOneSchema,
} from "@/schema/assessment/soc-assess/addtional-field-one";
import { SectionAForm } from "@/schema/assessment/soc-assess/section-a";
import { ObjectData } from "@/types";

import Allergies from "./allergies";
import CaregiverSafety from "./caregiver-safety";
import CoordinationOfCare from "./coordination-of-care";
import EducationDiscipline from "./education-discipline";
import FallRisAssessment from "./fall-risk-assessment";
import FunctionalEquipment from "./functional-equipment";
import GenitourinaryDialysis from "./genitourinary-dialysis";
import HomeBoundStatus from "./homebound-status";
import ImmunizationScreening from "./immunization-screening";
import MentalMusculoSkeletal from "./mental-musculoskeletal";
import NeuroPyschoSocial from "./neuro-psychosocial";
import Nutritional from "./nutritional";
import PainOstomy from "./pain-ostomy";
import PlanArrangements from "./plan-arrangement";
import ReproductiveGastroIntestinal from "./reproductive-gastrointestinal";
import RespiratoryCardiac from "./respiratory-cardiac";
import SafetyStatus from "./safety-status";
import SiteLocation from "./site-location";

const AddtionalFieldOne = ({
  assessmentId,
  patientScheduleId,
  mutate,
  assessment,
  data,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionAForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<AdditionalFieldOneForm>({
    resolver: zodResolver(additionalFieldOneSchema),
    defaultValues: additionalFieldOneDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();

  useEffect(() => {
    if (updateresponse?.success) {
      toast.success(updateresponse?.message);
      mutate();
      setAction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateresponse]);

  const updateStatus = async (status: QAStatus) => {
    await updateQAStatus({
      status,
      id: assessmentId as string,
      qaComment,
    });
  };

  return (
    <Form {...methods}>
      <PromptModal
        title={action === "APPROVED" ? "Approve" : "Disapprove"}
        variant={action === "APPROVED" ? "default" : "destructive"}
        open={!!action}
        onClose={() => setAction(undefined)}
        callback={async () => {
          updateStatus(action as QAStatus);
        }}
        loading={updating}
      >
        <div className="mb-5">
          <p className="mb-4  font-semibold">QA Comment</p>
          <Textarea
            value={qaComment}
            onChange={(e) => setQaComment(e.target.value)}
            placeholder="Add QA comments"
            rows={5}
          />
        </div>
      </PromptModal>

      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({
              ...assessment,
              additionalFieldOne: formData,
            }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div className="flex justify-end text-end mt-2 gap-2">
            {!isQA ? (
              <>
                <Button className="px-6" loading={isMutating}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="px-6"
                  type="button"
                  onClick={() => {
                    setAction("APPROVED");
                  }}
                >
                  Approve
                </Button>
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAction("REJECTED");
                  }}
                >
                  Disapprove
                </Button>
              </>
            )}
          </div>
          <div>
            <PlanArrangements methods={methods} />
            <CaregiverSafety methods={methods} />
            <SafetyStatus methods={methods} />
            <PainOstomy methods={methods} />
            <SiteLocation methods={methods} />
            <RespiratoryCardiac methods={methods} />
            <GenitourinaryDialysis methods={methods} />
            <ReproductiveGastroIntestinal methods={methods} />
            <NeuroPyschoSocial methods={methods} />
            <MentalMusculoSkeletal methods={methods} />
            <FunctionalEquipment methods={methods} />
            <FallRisAssessment methods={methods} />
            <Nutritional methods={methods} />
            <CoordinationOfCare methods={methods} />
            <ImmunizationScreening methods={methods} />
            <EducationDiscipline methods={methods} />
            <Allergies methods={methods} />
            <HomeBoundStatus methods={methods} />
          </div>
        </div>
        <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="px-6"
                type="button"
                onClick={() => {
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddtionalFieldOne;
