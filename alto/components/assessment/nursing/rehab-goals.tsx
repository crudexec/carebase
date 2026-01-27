"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
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
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  rehabGoalDefaultvalues,
  RehabGoalsForm,
  rehabGoalsSchema,
} from "@/schema/assessment/nursing/rehab-goals";
import { ObjectData } from "@/types";

const RehabGoals = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: RehabGoalsForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<RehabGoalsForm>({
    resolver: zodResolver(rehabGoalsSchema),
    defaultValues: rehabGoalDefaultvalues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
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

      <AppLoader loading={false} />
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            nursingAssessment: parseData({ ...assessment, rehabGoals: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div>
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
              <FormHeader className="mt-4">
                DISCIPLINE GOALS AND DATE WILL BE ACHIEVED
              </FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">Nursing:</p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"demonstratesCompliance"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates compliance with medication by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"demonstratesComplianceDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"stabilizationOfCardiovascular"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Stabilization of cardiovascular pulmonary condition
                            by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"stabilizationOfCardiovascularDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"demonstratesCompetence"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates competence in following medical regime
                            by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"demonstratesCompetenceDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"verbalizesPainControlled"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Verbalizes pain controlled at acceptance level by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"verbalizesPainControlledDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"demonstratesIndependence"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates independence in
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"demonstratesIndependenceBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"demonstratesIndependenceDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"verbalizesDemonstratesIndependence"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Verbalizes/Demonstrates independence with care by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"verbalizesDemonstratesIndependenceDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"woundHealingWithoutComplications"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Wound healing without complications by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"woundHealingWithoutComplicationsDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"expectDailySNVisitsToEndBy"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Expect daily SN visits to end by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"expectDailySNVisitsToEndByDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherNursing"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherNursingBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherNursingDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">Physical Therapy:</p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"physicalTherapyDemonstratesAbility"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates ability to follow home exercise program
                            by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"physicalTherapyDemonstratesAbilityDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapyBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPhysicalTherapyDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">Occupational Therapy:</p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyDemonstratesAbility"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates ability to follow home exercise program
                            by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"occupationalTherapyDemonstratesAbilityDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapyBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherOccupationalTherapyDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">Speech Therapy:</p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"speechTherapyDemonstratesSwallowingSkills"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Demonstrates swallowing skills in formal/informal
                            dysphagia evaluation exercise program by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"speechTherapyDemonstratesSwallowingSkillsDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"speechTherapyCompletesProgram"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Completes speech therapy program by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"speechTherapyCompletesProgramDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherSpeechTherapy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherSpeechTherapyBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherSpeechTherapyDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">Aide:</p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"aideAssumesResponsibility"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            {" "}
                            Assumes responsibility for personal care needs by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"aideAssumesResponsibilityDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherAide"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherAideBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherAideDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">
                  Medical Social Services:
                </p>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"medicalVerbalizeInformation"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Verbalize information about community resources and
                            how to obtain assistance by
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"medicalVerbalizeInformationDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherMedicalSocialServices"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherMedicalSocialServicesBy"}
                    render={({ field }) => (
                      <FormRender label="By">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherMedicalSocialServicesDate"}
                    render={({ field }) => (
                      <FormRender label="Date">
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">DISCHARGE PLANS</p>
                <div className="grid gap-5">
                  <FormField
                    control={methods.control}
                    name={"dischargePlans"}
                    render={() => (
                      <FormRender formClassName="grid md:grid-cols-2 gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "return-to-an-independent",
                              label:
                                "Return to an independent level of care (self-care)",
                            },
                            {
                              value: "patient-knowledgeable",
                              label:
                                "When patient knowledgeable about when to notify physician",
                            },
                            {
                              value: "medical-condition-stabilizes",
                              label: "Medical condition stabilizes",
                            },
                            {
                              value: "able-to-remain-in-residence",
                              label:
                                "Able to remain in residence with assistance of primary caregiver/support from community agencies",
                            },
                            {
                              value: "able-to-understand-medication",
                              label:
                                "Able to understand medication regime and care related to diagnoses",
                            },
                            {
                              value: "functional-potential",
                              label:
                                "When maximum functional potential reached",
                            },
                          ]}
                          name={"dischargePlans"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherDischargePlans"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={"discussedWithPatient"}
                      render={({ field }) => (
                        <FormRender label="DISCUSSED WITH PATIENT">
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
                      name={"rehabPotential"}
                      render={({ field }) => (
                        <FormRender label="REHAB POTENTIAL:">
                          <RadioInput
                            className="flex-row gap-3 items-start"
                            {...field}
                            options={[
                              { value: "POOR", label: "Poor" },
                              { value: "FAIR", label: "Fair" },
                              { value: "GOOD", label: "Good" },
                              { value: "EXCELLENT", label: "Excellent" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">SIGNATURE/DATES</FormHeader>

              <div className="grid md:grid-cols-2 items-center gap-5">
                <FormField
                  control={methods.control}
                  name={"signaturePatientCaregiver"}
                  render={({ field }) => (
                    <FormRender>
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "patient", label: "Patient" },
                          { value: "caregiver", label: "Caregiver" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"signaturePatientCaregiverName"}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"signature"}
                  render={({ field }) => (
                    <FormRender label="Person Completing This Form (E-Signature/Title)">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"signatureDate"}
                  render={({ field }) => (
                    <FormRender label="Date">
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
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

export default RehabGoals;
