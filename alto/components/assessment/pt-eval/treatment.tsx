"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  treatmentDefaultValue,
  TreatmentForm,
  treatmentSchema,
} from "@/schema/assessment/pt-eval/treatment";
import { ObjectData } from "@/types";

const Treatment = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: TreatmentForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<TreatmentForm>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: treatmentDefaultValue,
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
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            ptEval: parseData({ ...assessment, treatment: data }),
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
            <div>
              <FormHeader className="mt-4">SUBJECTIVE INFORMATION</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"subjectiveInformation"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MEDICAL HISTORY</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"medicalHistory"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                TREATMENT PLAN/PLAN OF CARE ORDERS
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatmentPlan"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "evaluation", label: "Evaluation" },
                          {
                            value: "established-upgrade",
                            label: "Established Upgrade Home Prog",
                          },
                          {
                            value: "patient-care-plan",
                            label: "Mgmt/Eval of Patient Care Plan",
                          },
                          {
                            value: "transfer-training",
                            label: "Transfer Training",
                          },
                          {
                            value: "chest-physiotherapy",
                            label: "Chest Physiotherapy",
                          },
                          {
                            value: "therapeutic-exercises",
                            label: "Therapeutic Exercises",
                          },
                          {
                            value: "electro-therapy",
                            label: "Electro Therapy",
                          },
                          {
                            value: "prosthetic-therapy",
                            label: "Prosthetic Therapy",
                          },
                          {
                            value: "fabrication-temp-devices",
                            label: "Fabrication Temp Devices",
                          },
                          {
                            value: "muscle-re-education",
                            label: "Muscle Re-Education",
                          },
                          { value: "gait-training", label: "Gait Training" },
                          { value: "ultrasound", label: "Ultrasound" },
                        ]}
                        name={"treatmentPlan"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherTreatmentPlan"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                CLINICAL NARRATIVE SUMMARY
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"clinicalNarrativeSummary"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Treatment GOALS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatmentGoals"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">FREQUENCY/DURATIONS</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"frequency"}
                  render={({ field }) => (
                    <FormRender formClassName="lg:col-span-2">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"certificationFrom"}
                  render={({ field }) => (
                    <FormRender label="Certification From:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"certificationTo"}
                  render={({ field }) => (
                    <FormRender label="Certification To:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"recertificationFrom"}
                  render={({ field }) => (
                    <FormRender label="Recertification From:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"recertificationTo"}
                  render={({ field }) => (
                    <FormRender label="Recertification To:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PHYSICAL THERAPIST SIGNATURE/DATE OF VERBAL ORDER FOR PHYSICAL
                THERAPY PLAN OF CARE
              </FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"physicalTherapistSignature"}
                  render={({ field }) => (
                    <FormRender label="Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"physicalTherapistSignatureDate"}
                  render={({ field }) => (
                    <FormRender label="Signature Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">COORDINATION OF CARE</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"coordinationOfCare"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "RN", label: "RN" },
                          { value: "LVN", label: "LVN/LPN" },
                          { value: "PT", label: "PT" },
                          { value: "OT", label: "OT" },
                          { value: "PTA", label: "PTA" },
                          { value: "COTA", label: "COTA" },
                          { value: "ST", label: "ST" },
                          { value: "physician", label: "Physician" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"coordinationOfCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isLastPhysician"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Last Physician N/A</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"lastPhysicianVisit"}
                  render={({ field }) => (
                    <FormRender label="Last Physician Visit:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"discussion"}
                  render={({ field }) => (
                    <FormRender label="Discussion:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
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

export default Treatment;
