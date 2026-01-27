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
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  bodyAssessmentDefayltValues,
  BodyAssessmentForm,
  bodyAssessmentSchema,
} from "@/schema/assessment/nursing";
import { ObjectData } from "@/types";

const BodyAssessment = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: BodyAssessmentForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<BodyAssessmentForm>({
    resolver: zodResolver(bodyAssessmentSchema),
    defaultValues: bodyAssessmentDefayltValues,
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
              bodyAssessment: data,
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
                  </Button>{" "}
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
                  </Button>{" "}
                  <Button
                    className="px-6"
                    variant="destructive"
                    type="button"
                    onClick={() => {
                      setAction("REJECTED");
                    }}
                  >
                    Disapprove
                  </Button>{" "}
                </>
              )}
            </div>

            <div>
              <FormHeader className="mt-4">
                ENTERAL FEEDING-ACCESS DEVICE
              </FormHeader>
              <div className="grid gap-5">
                <div className="flex items-center gap-5">
                  <FormField
                    control={methods.control}
                    name={"isEnteralFeedingNA"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">N/A</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNoEnteralFeedingProblem"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">No Problem</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"enteralFeedingAccessDevice"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "nasogastric", label: "Nasogastric" },
                          { value: "gastronomy", label: "Gastronomy" },
                          { value: "jejunostomy", label: "Jejunostomy" },
                        ]}
                        name={"enteralFeedingAccessDevice"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceOther"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other(specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceOtherDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDevicePump"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Pump:(type/specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDevicePumpDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"enteralFeedingAccessDeviceContinuous"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "bolus", label: "Bolus" },
                          { value: "continuous", label: "Continuous" },
                        ]}
                        name={"enteralFeedingAccessDeviceContinuous"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceFeeding"}
                    render={({ field }) => (
                      <FormRender label="Feeding:Type(amt./specify)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceFlush"}
                    render={({ field }) => (
                      <FormRender label="Flush Protocol:(amt./specify)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDevicePerfomedBy"}
                    render={() => (
                      <FormRender
                        label="Performed by:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "self", label: "Self" },
                            { value: "RN", label: "RN" },
                            { value: "caregiver", label: "Caregiver" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"enteralFeedingAccessDevicePerfomedBy"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDevicePerformedByOther"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceDressing"}
                    render={({ field }) => (
                      <FormRender label="Dressing/Site care:(specify)">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"enteralFeedingAccessDeviceIntervention"}
                    render={({ field }) => (
                      <FormRender label="Interventions/Instructions/Comments">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"enteralFeedingAccessDeviceNoProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">INFUSION</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isFusionNA"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">N/A</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"infusionMedline"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "peripheral-line",
                            label: "Peripheral line",
                          },
                          {
                            value: "medline-catheter",
                            label: "Medline catheter",
                          },
                          { value: "central-line", label: "Central-line" },
                        ]}
                        name={"infusionMedline"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={methods.control}
                    name={"infusionType"}
                    render={({ field }) => (
                      <FormRender label="Type/brand">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"infusionSize"}
                    render={({ field }) => (
                      <FormRender label="Size/gauge/length">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"infusionGroshong"}
                  render={() => (
                    <FormRender
                      label="Performed by:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "groshong", label: "Groshong" },
                          { value: "none-groshong", label: "None Groshong" },
                          { value: "tunnel", label: "Tunnel" },
                          { value: "none-tunneled", label: "None tunneled" },
                        ]}
                        name={"infusionGroshong"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={methods.control}
                    name={"infusionInsertionSite"}
                    render={({ field }) => (
                      <FormRender label="Insertion site">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"infusionInsertionDate"}
                    render={({ field }) => (
                      <FormRender label="Insertion date">
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
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"infusionLumens"}
                    render={() => (
                      <FormRender
                        label="Lumens:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "single", label: "Single" },
                            { value: "double", label: "Double" },
                            { value: "triple", label: "Triple" },
                          ]}
                          name={"infusionLumens"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"infusinFrequency"}
                    render={({ field }) => (
                      <FormRender label="Flush solution/frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"infusionPatient"}
                  render={() => (
                    <FormRender
                      label="Patent:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                        name={"infusionPatient"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={methods.control}
                    name={"infusionSkinCondition"}
                    render={({ field }) => (
                      <FormRender label="Site/skin condition">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"infusionExternalCatheter"}
                    render={({ field }) => (
                      <FormRender label="External catheter length">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"infusionOther"}
                  render={({ field }) => (
                    <FormRender label="Other">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">PICC specific:</p>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"circumferenceOfArm"}
                    render={({ field }) => (
                      <FormRender label="Circumference of arm">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"xrayVerification"}
                    render={() => (
                      <FormRender
                        label="X-ray verification:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                          name={"xrayVerification"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">IV AD Port Specific:</p>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"portSpecificReservior"}
                    render={() => (
                      <FormRender
                        label="Reservior:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "single", label: "Single" },
                            { value: "double", label: "Double" },
                          ]}
                          name={"portSpecificReservior"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"huberGauge"}
                    render={({ field }) => (
                      <FormRender label="Huber gauge/length">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"portSpecificAccessed"}
                    render={() => (
                      <FormRender
                        label="Accessed:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                          name={"portSpecificAccessed"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"portSpecificAccessedDate"}
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
                  Epidural/Intrathecal Access:
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"epiduralSkinCondition"}
                    render={({ field }) => (
                      <FormRender label="Site/skin condition">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"epiduralInfusionSolution"}
                    render={({ field }) => (
                      <FormRender label="Infusion solution(type/volume/rate)">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"epiduralDressing"}
                    render={({ field }) => (
                      <FormRender label="Dressing">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"epiduralOther"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isMedicationAdministered"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Medication(s)administered:(name of drug)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicationAdministered"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicationAdministeredDose"}
                    render={({ field }) => (
                      <FormRender label="Dose">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicationAdministeredRoute"}
                    render={({ field }) => (
                      <FormRender label="Route">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicationAdministeredFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"medicationAdministeredDurationofTherapy"}
                    render={({ field }) => (
                      <FormRender label="Duration of therapy">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isEpiduralPump"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Pump: (type,specify)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"epiduralPumpDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"epiduralAdministeredBy"}
                    render={() => (
                      <FormRender
                        label="Administered by:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "self", label: "Self" },
                            { value: "RN", label: "RN" },
                            { value: "caregiver", label: "Caregiver" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"epiduralAdministeredBy"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"epiduralAdministeredByDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">
                  Purpose of Intravenous Access:
                </p>
                <FormField
                  control={methods.control}
                  name={"purposeOfIntravenousAccess"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "antibiotic-therapy",
                            label: "Antibiotic therapy",
                          },
                          { value: "pain-control", label: "Pain control" },
                          { value: "lab-draws", label: "Lab draws" },
                          { value: "chemotherapy", label: "Chemotherapy" },
                          {
                            value: "venous-access",
                            label: "Maintain venous access",
                          },
                          { value: "hydration", label: "Hydration" },
                          {
                            value: "parenteral-nutrition",
                            label: "Parenteral nutrition",
                          },
                        ]}
                        name={"purposeOfIntravenousAccess"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isOtherPurposeOfIntravenousAccess"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPurposeOfIntravenousAccessDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isPurposeOfIntravenousAccessInfusion"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Infusion care provided during visit
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"purposeOfIntravenousAccessInfusionDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoInfusionProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                APPLIANCES/AIDS/SPECIAL EQUIPMENT
              </FormHeader>
              <div className="grid gap-5">
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isApplianceBrace"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Brace/Orthotics(specify)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"applianceBraceDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"applianceTransferEquipment"}
                  render={() => (
                    <FormRender
                      label="Transfer Equipment"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "board", label: "Board" },
                          { value: "lift", label: "Lift" },
                        ]}
                        name={"applianceTransferEquipment"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isApplianceBedsideCommode"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Bedside commode</span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-3 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"applianceProsthesis"}
                    render={() => (
                      <FormRender
                        label="Prosthesis"
                        formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "RUE", label: "RUE" },
                            { value: "RLE", label: "RLE" },
                            { value: "LUE", label: "LUE" },
                            { value: "LLE", label: "LLE" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"applianceProsthesis"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"applianceProsthesisOther"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-3 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"applianceHospitalBed"}
                    render={() => (
                      <FormRender
                        label="Hospital bed:"
                        formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "semi-elec", label: "Semi-elec" },
                            { value: "crank", label: "Crank" },
                            { value: "spec", label: "Spec" },
                          ]}
                          name={"applianceHospitalBed"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"applianceHospitalBedDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"applianceOverlays"}
                  render={({ field }) => (
                    <FormRender label="Overlays">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isApplianceOxygen"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Oxygen</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"applianceHMECo"}
                    render={({ field }) => (
                      <FormRender label="HME Co.">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-3 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"equipmentNeeds"}
                    render={() => (
                      <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "lifeline", label: "Lifeline" },
                            { value: "fire-alarm", label: "Fire Alarm" },
                            { value: "smoke-alarm", label: "Smoke Alarm" },
                            {
                              value: "equipment-needs",
                              label: "Equipment needs(specify)",
                            },
                          ]}
                          name={"equipmentNeeds"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherEquipmentNeeds"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isOtherAppliance"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other(specific)</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherApplianceDetails"}
                    render={({ field }) => (
                      <FormRender label="">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 items-center gap-5  border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isApplianceInstructions"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Interventions/Instructions
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"applianceInstructionsDetails"}
                    render={({ field }) => (
                      <FormRender label="">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isNoApplianceProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Patient Factors</FormHeader>
              <div>
                <div className="bg-secondary p-4 font-semibold grid grid-col-1 md:grid-cols-5 gap-5 my-5">
                  <p className="md:col-span-3">
                    Assess each factor and check the score when "yes", then
                    total the point.
                  </p>
                  <div className="md:col-span-2 gap-5 grid grid-cols-2">
                    <p>POINTS</p>
                    <p>YES</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      History of falls(any in the past 3 months?)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>15</p>
                      <FormField
                        control={methods.control}
                        name={"isHistoryOfFalls"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Sensory deficit(vision and/or hearing)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isSensoryDeficit"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Age(over 65)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>

                      <FormField
                        control={methods.control}
                        name={"isAgeOver65"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Confusion
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>

                      <FormField
                        control={methods.control}
                        name={"isConfusion"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Impaired Judgement
                    </p>

                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>

                      <FormField
                        control={methods.control}
                        name={"isImpairedJudgement"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Decreased level of cooperation
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>

                      <FormField
                        control={methods.control}
                        name={"isDecreasedCooperation"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Increased anxiety/emotional liability
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isIncreasedAnxiety"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Unable to ambulate independently(needs to use ambulatory
                      aide,chair board,etc.)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isUnableToAmbulateIndependently"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Gait/balance/coordination problems
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isGaitBalanceCoordinationProblems"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Incontinence/urgency
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isIncontinenceUrgency"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Cardiovascular/respiratory disease affecting perfusion
                      and/or oxygenation
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isCardiovascularRespiratoryDisease"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Postural hypotension with dizziness
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isPosturalHypotension"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Medications affecting blood pressure or level of
                      consiousness (consider
                      antihistamines,antihypertensives,antiseizure,benzodiazepine,antiseizure,cathartics,
                      diuretics,hypoglycemic,narcotics,psychotropics,sedatives/hypnotics)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isMedicationsAffectingPressure"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Alcohol use
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isAlcoholUse"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Home safety issues(lighting,pathway,cord,tubing,floor
                      coverings,stairs,etc)
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isHomeSafetyIssues"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                    <p className="font-semibold md:col-span-3 break-words break-all">
                      Lack of home modifications(bathroom,kitchen,stairs
                      entries,etc.)e
                    </p>
                    <div className="md:col-span-2 gap-5 grid grid-cols-2">
                      <p>5</p>
                      <FormField
                        control={methods.control}
                        name={"isLackOfHomeModifications"}
                        render={({ field }) => (
                          <FormRender>
                            <div>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-center text-lg font-bold pt-4 border-t border-b my-5">
                  Total Points()
                </p>
                <div className="text-sm">
                  <p className="font-semibold">
                    Implement fall precautions for a total score of 15 or
                    greater.As guided by organizational guidelines:
                  </p>
                  <p>
                    1.Education on fall prevention strategies specific to areas
                    of risk.
                  </p>
                  <p>2.Refer to Physical Therapy and/or Occupational Therapy</p>
                  <p>3.Monitor areas of risk to reduce falls</p>
                  <p>4.Reassessment patient</p>
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
              </Button>{" "}
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
              </Button>{" "}
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>{" "}
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default BodyAssessment;
