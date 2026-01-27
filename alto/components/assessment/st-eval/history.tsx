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
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  historyDefaultValue,
  HistoryForm,
  historySchema,
} from "@/schema/assessment/st-eval/history";
import { ObjectData } from "@/types";

const History = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: HistoryForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    defaultValues: historyDefaultValue,
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
            stEval: parseData({ ...assessment, history: data }),
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
              <FormHeader className="mt-4">DIAGNOSIS</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`facility`}
                  render={({ field }) => (
                    <FormRender label="Facility:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`medicalDiagnosis`}
                  render={({ field }) => (
                    <FormRender label="Medical Diagnosis:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medicalDiagnosisOnsetDate"}
                  render={({ field }) => (
                    <FormRender label="Medical Diagnosis Onset Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`speechDiagnosis`}
                  render={({ field }) => (
                    <FormRender label="Speech Diagnosis:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"speechDiagnosisOnsetDate"}
                  render={({ field }) => (
                    <FormRender label="Speech Diagnosis Onset Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`previousSpeechTherapy`}
                  render={({ field }) => (
                    <FormRender label="Previous Speech Therapy:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`priorFunctionalLabel`}
                  render={({ field }) => (
                    <FormRender label="Prior Functional Label:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`history`}
                  render={({ field }) => (
                    <FormRender label="History:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">BACKGROUND INFORMATION</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`backgroundInformationDiagnosis`}
                  render={({ field }) => (
                    <FormRender label="Diagnosis:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`backgroundInformationPrecaution`}
                  render={({ field }) => (
                    <FormRender label="Precautions:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherPertinentMedicalHistory`}
                  render={({ field }) => (
                    <FormRender label="Other Pertinent Medical History:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PAIN ASSESSMENT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`painAssessmentLocation`}
                  render={({ field }) => (
                    <FormRender label="Location:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"painAssessmentIntensity"}
                  render={({ field }) => (
                    <FormRender label="Intensity:">
                      <SelectInput
                        options={[
                          { label: "0", value: "0" },
                          { label: "1", value: "1" },
                          { label: "2", value: "2" },
                          { label: "3", value: "3" },
                          { label: "4", value: "4" },
                          { label: "5", value: "5" },
                          { label: "6", value: "6" },
                          { label: "7", value: "7" },
                          { label: "8", value: "8" },
                          { label: "9", value: "9" },
                          { label: "10", value: "10" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painAssessmentDuration`}
                  render={({ field }) => (
                    <FormRender label="Duration:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painAssessmentMedication`}
                  render={({ field }) => (
                    <FormRender label="Medication:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"referralNeeded"}
                  render={({ field }) => (
                    <FormRender label="Referral Needed:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`referredTo`}
                  render={({ field }) => (
                    <FormRender label="Referred To:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"impactingFunction"}
                  render={({ field }) => (
                    <FormRender label="Impacting Function:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painAssessmentComments`}
                  render={({ field }) => (
                    <FormRender label="Referred To:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"pocGoalNeeded"}
                  render={({ field }) => (
                    <FormRender label="POC Goal Needed:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">EVALUATIONS</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"safeSwallowingEvaluation"}
                  render={({ field }) => (
                    <FormRender label="Safe Swallowing Evaluation:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`safeSwallowingComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"videoFluoroscopy"}
                  render={({ field }) => (
                    <FormRender label="Video Fluoroscopy:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`videoFluoroscopyComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">DIET</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`currentDietLevel`}
                  render={({ field }) => (
                    <FormRender
                      label="Current Diet Level:"
                      formClassName="lg:col-span-2"
                    >
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`weight`}
                  render={({ field }) => (
                    <FormRender label="Weight:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"weightLoss"}
                  render={({ field }) => (
                    <FormRender label="Weight Loss:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"liquid"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "thin", label: "Thin" },
                          { value: "thickened", label: "Thickened" },
                        ]}
                        name={"liquid"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherLiquid`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`dietComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PRIOR LEVEL OF FUNCTIONING WITH ADL'S
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"priorLevelOfFunctioning"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "independent", label: "Independent" },
                          { value: "needed-assist", label: "Needed Assist" },
                          { value: "total-assist", label: "Total Assist" },
                        ]}
                        name={"priorLevelOfFunctioning"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"reportedBy"}
                  render={() => (
                    <FormRender
                      label="Reported By:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "patient", label: "Patient" },
                          { value: "family", label: "Family" },
                          { value: "caregiver", label: "Caregiver" },
                        ]}
                        name={"reportedBy"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOME EVALUATION</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"homeEvaluation"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "alone", label: "Alone" },
                          { value: "no-caregiver", label: "No Caregiver" },
                          { value: "caregiver", label: "Caregiver" },
                          {
                            value: "limited Support",
                            label: "Limited Support",
                          },
                        ]}
                        name={"homeEvaluation"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`homeEvaluationComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"historyOfFall"}
                  render={({ field }) => (
                    <FormRender label="History of Falls:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`lastFall`}
                  render={({ field }) => (
                    <FormRender label="Last Fall:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"interventionOfPlace"}
                  render={({ field }) => (
                    <FormRender label="Intervention in Place:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`interventionComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
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

export default History;
