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
  livingAssessmentDefaultvalues,
  LivingAssessmentForm,
  livingAssessmentSchema,
} from "@/schema/assessment/nursing";
import { ObjectData } from "@/types";

const LivingAssessment = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: LivingAssessmentForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<LivingAssessmentForm>({
    resolver: zodResolver(livingAssessmentSchema),
    defaultValues: livingAssessmentDefaultvalues,
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
            nursingAssessment: parseData({
              ...assessment,
              livingAssessment: data,
            }),
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
                LIVING ARRANGEMENTS/SUPPORTIVE ASSISTANCE
              </FormHeader>
              <div>
                <p className="text-sm font-semibold pb-5">Safety Measures:</p>
                <FormField
                  control={methods.control}
                  name={"safetyMeasures"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "bleeding-precautions",
                            label: "Bleeding precautions",
                          },
                          { value: "O2-precautions", label: "O2 precautions" },
                          {
                            value: "seizure-precautions ",
                            label: "Seizure precautions ",
                          },
                          {
                            value: "fall-precautions",
                            label: "Fall precautions",
                          },
                          { value: "side-rails-up", label: "Side rails up" },
                          {
                            value: "elevate-head",
                            label: "Elevate head of bed",
                          },
                          {
                            value: "24hr-suspension",
                            label: "24hr.suspension",
                          },
                          { value: "clear-pathways", label: "Clear pathways" },
                          {
                            value: "lock-with-transfers",
                            label: "Lock w/c with transfers",
                          },
                          {
                            value: "infection-control-measures",
                            label: "Infection control measures",
                          },
                          { value: "walker", label: "Walker/cane" },
                        ]}
                        name={"safetyMeasures"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <div>
              <FormHeader className="mt-4">HOME ENVIRONMENT SAFETY</FormHeader>
              <div className="grid gap-5">
                <div>
                  <div className="bg-secondary p-4 font-semibold grid grid-col-1 md:grid-cols-5 gap-5 mb-5">
                    <p className="md:col-span-3">Safety hazards in the home</p>
                    <div className="md:col-span-2 grid grid-cols-2 gap-5">
                      <p>YES</p>
                      <p>No</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Unsound structure
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"unsoundStructure"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid  grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Inadequate heating/cooling/electricity
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"inadequateHeating"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Inadequate sanitation
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"inadequateSanitation"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Inadequate refrigeration
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"inadequateRefrigeration"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Unsafe gas/electrical appliances or outlets
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"unsafeGas"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Inadequate running water
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"inadequateRunningWater"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Unsafe storage of supplies/equipment
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"unsafeStorageSupplies"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        No telephone available and/or unable to use phone
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"noTelephoneAvailable"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Insects/rodents
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"insects"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Medications stored safely
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"medicationsStoredSafely"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Emergency planning/fire safety:
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"emergencyPlanningFireSafety"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Smoke detectors on all levels of home
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"smokeDetectors"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Tested and functioning
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"testedFunctioning"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        More than one exit
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"moreThanOneExit"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Plan for exit
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"planForExit"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">Oxygen use:</p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"oxygenUse"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Signs posted:
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"signsPosted"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Handles smoking/flammables safely
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"handleSmoking"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Oxygen back-up
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"oxygenBackUp"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                      <p className="font-semibold md:col-span-3">
                        Electrical/fire safety
                      </p>
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"electricalFireSafety"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="grid grid-cols-2 gap-5"
                                {...field}
                                options={[
                                  { value: "yes", label: "" },
                                  { value: "no", label: "" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <FormField
                  control={methods.control}
                  name={"homeEnvironmentSafetyComments"}
                  render={({ field }) => (
                    <FormRender label="Comments">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">
                  Instructions/Materials Provided(check all applicable items):
                </p>
                <FormField
                  control={methods.control}
                  name={"instructionsMaterials"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "rights-and-responsibilities",
                            label: "Rights and responsibilities",
                          },
                          {
                            value: "state-hotline-number",
                            label: "State hotline number",
                          },
                          {
                            value: "advanced-directives",
                            label: "Advanced directives",
                          },
                          { value: "DNR", label: "Do not resuscitate(DNR)" },
                        ]}
                        name={"instructionsMaterials"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"instructionsMaterialsPrivacy"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "HIPPA Notice of Privacy Practices",
                            label: "HIPPA Notice of Privacy Practices",
                          },
                          {
                            value: "OASIS-privacy-notice",
                            label: "OASIS Privacy Notice",
                          },
                          {
                            value: "emergency-planning-disrupted",
                            label:
                              "Emergency planning in the event service is disrupted",
                          },
                        ]}
                        name={"instructionsMaterialsPrivacy"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"instructionsMaterialsStandardPrecautions"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "agency-phone",
                            label: "Agency phone number/after hours number",
                          },
                          {
                            value: "contact-physician",
                            label: "When to contact physician and/or agency",
                          },
                          {
                            value: "standard-precautions",
                            label: "Standard precautions/handwashing",
                          },
                        ]}
                        name={"instructionsMaterialsStandardPrecautions"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"backHomeSafety"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Basic home safety</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"instructionDisease"}
                    render={({ field }) => (
                      <FormRender label="Disease">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicalRegime"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Medication regime/administration
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"otherMedicationRegime"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <div>
              <FormHeader className="mt-4">
                ACTIVITIES OF DAILY LIVING
              </FormHeader>
              <div className="grid gap-5">
                <div>
                  <div className="bg-secondary p-4 font-semibold grid grid-col-1 lg:grid-cols-5 gap-5 mb-5">
                    <p>ACTIVITY</p>
                    <p>I</p>
                    <p>A</p>
                    <p>D</p>
                    <p>TEACH/TRAIN</p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Eating</p>
                      <FormField
                        control={methods.control}
                        name={"eatingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"eatingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"eatingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"eatingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Transfer</p>
                      <FormField
                        control={methods.control}
                        name={"transferI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"transferA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"transferD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"transferTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Dressing/Grooming</p>
                      <FormField
                        control={methods.control}
                        name={"dressingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dressingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dressingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dressingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Bathing</p>
                      <FormField
                        control={methods.control}
                        name={"bathingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"bathingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"bathingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"bathingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Toileting</p>
                      <FormField
                        control={methods.control}
                        name={"toiletingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"toiletingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"toiletingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"toiletingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Ambulation</p>
                      <FormField
                        control={methods.control}
                        name={"ambulationI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"ambulationA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"ambulationD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"ambulationTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Communication</p>
                      <FormField
                        control={methods.control}
                        name={"communicationI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"communicationA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"communicationD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"communicationTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Preparing light meals</p>
                      <FormField
                        control={methods.control}
                        name={"preparingLightMealsI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingLightMealsA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingLightMealsD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingLightMealsTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Preparing full m eals</p>
                      <FormField
                        control={methods.control}
                        name={"preparingFullMealsI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingFullMealsA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingFullMealsD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"preparingFullMealsTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Light housekeeping</p>
                      <FormField
                        control={methods.control}
                        name={"lightHouseKeepingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"lightHouseKeepingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"lightHouseKeepingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"lightHouseKeepingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Personal laundry</p>
                      <FormField
                        control={methods.control}
                        name={"personalLaundryI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"personalLaundryA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"personalLaundryD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"personalLaundryTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Handling money</p>
                      <FormField
                        control={methods.control}
                        name={"handlingMoneyI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"handlingMoneyA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"handlingMoneyD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"handlingMoneyTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Using telephone</p>
                      <FormField
                        control={methods.control}
                        name={"usingTelephoneI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"usingTelephoneA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"usingTelephoneD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"usingTelephoneTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Reading</p>
                      <FormField
                        control={methods.control}
                        name={"readingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"readingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"readingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"readingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Writing</p>
                      <FormField
                        control={methods.control}
                        name={"writingI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"writingA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"writingD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"writingTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Managing Medications</p>
                      <FormField
                        control={methods.control}
                        name={"managingMedicationsI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"managingMedicationsA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"managingMedicationsD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"managingMedicationsTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                    <div className="text-sm grid grid-col-1 lg:grid-cols-5 items-center gap-5 px-4">
                      <p className="font-semibold">Other(Specify)</p>
                      <FormField
                        control={methods.control}
                        name={"otherI"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"otherA"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"otherD"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"otherTeachTrain"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOSPITAL RISK ASSESSMENT</FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">(If applicable):</p>
                <FormField
                  control={methods.control}
                  name={"assistanceHomeboundReason"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "needs-assistance",
                            label: "Needs assistance for all activities",
                          },
                          {
                            value: "residual-weakness",
                            label: "Residual weakness",
                          },
                          {
                            value: "requires-assistance-to-ambulate",
                            label: "Requires assistance to ambulate",
                          },
                        ]}
                        name={"assistanceHomeboundReason"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"confusionHomeboundReason"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "confusion",
                            label: "Confusion,unable to go out of home alone",
                          },
                          {
                            value: "unable-to-leave-home-unassisted",
                            label: "Unable to safely leave home unassisted",
                          },
                          {
                            value: "severe-SOB",
                            label: "Severe SOB, upon exertion",
                          },
                        ]}
                        name={"confusionHomeboundReason"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dependentHomeboundReason"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "dependent-upon-adaptive-device",
                            label: "Dependent upon adaptive device(s)",
                          },
                          {
                            value: "unable-to-safely-leave-home",
                            label: "Unable to safely leave home unassisted",
                          },
                        ]}
                        name={"dependentHomeboundReason"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherHomeboundReason"}
                  render={({ field }) => (
                    <FormRender label="Other(Specify)">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">SUMMARY CHECKLIST</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"medicationStatus"}
                  render={() => (
                    <FormRender
                      label="MEDICATION STATUS:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "medication-regimen-completed",
                            label: "Medication regimen completed/reviewed",
                          },
                          { value: "no-change", label: "No Change" },
                          { value: "order-obtained", label: "Order obtained" },
                        ]}
                        name={"medicationStatus"}
                      />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">
                  Check if any of the following were identified:
                </p>
                <FormField
                  control={methods.control}
                  name={"summaryChecklist"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "potential-adverse-effects",
                            label: "Potential adverse effects/drug reaction",
                          },
                          {
                            value: "ineffective-drug-therapy",
                            label: "Ineffective drug therapy",
                          },
                          {
                            value: "significant-side-effects",
                            label: "Significant side effects",
                          },
                          {
                            value: "significant-drug-interactions",
                            label: "Significant drug interactions",
                          },
                          {
                            value: "duplicate-drug-therapy",
                            label: "Duplicate drug therapy",
                          },
                          {
                            value: "non-compliance-with-drug-therapy",
                            label: "Non-compliance with drug therapy",
                          },
                        ]}
                        name={"summaryChecklist"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"billableSuppliesRecorded"}
                  render={() => (
                    <FormRender
                      label="BILLABLE SUPPLIES RECORDED?"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                        name={"billableSuppliesRecorded"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"careCoordination"}
                  render={() => (
                    <FormRender
                      label="CARE COORDINATION"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "physician", label: "Physician" },
                          { value: "SN", label: "SN" },
                          { value: "PT", label: "PT" },
                          { value: "OT", label: "OT" },
                          { value: "ST", label: "ST" },
                          { value: "MSW", label: "MSW" },
                          { value: "aide", label: "Aide" },
                        ]}
                        name={"careCoordination"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherSummaryChecklist"}
                  render={({ field }) => (
                    <FormRender label="Other(Specify)">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                ADDITIONAL NOTES ON SKILLED CARE PROVIDED
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"skilledCare"}
                  render={({ field }) => (
                    <FormRender label="Skilled Care">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"nurseName"}
                    render={({ field }) => (
                      <FormRender label="Nurse Name:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"nurseSignature"}
                    render={({ field }) => (
                      <FormRender label="Nurse Signature:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
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

export default LivingAssessment;
