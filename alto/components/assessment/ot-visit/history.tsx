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
} from "@/schema/assessment/ot-visit/history";
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
  const [action, setAction] = useState<QAStatus>();
  const { trigger, isMutating, data: response } = useSaveAssessment();
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
            otVisit: parseData({ ...assessment, history: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
            visitDate: data?.visitDate,
            timeIn: data?.arrivalTime,
            timeOut: data?.departureTime,
          });
        })}
      >
        <div className="p-5">
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
            <div>
              <FormHeader className="mt-4">VISIT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"serviceProvided"}
                  render={({ field }) => (
                    <FormRender label="Service Provided:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "direct-care", label: "ST Direct Care" },
                          { value: "maintenace", label: "ST Maintenance" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"qCode"}
                  render={({ field }) => (
                    <FormRender label="Q Code:">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "patient-home",
                            label:
                              "Hospice or home health care provided in patients home/residence",
                          },
                          {
                            value: "assisted-living",
                            label:
                              "Hospice or home health care provided in assisted living facility",
                          },
                          {
                            value: "place-not-otherwise",
                            label:
                              "Hospice or home health care provided in place not otherwise specified (NO)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"visitBillable"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "billable", label: "Billable" },
                          { value: "non-billable", label: "Non-Billable" },
                        ]}
                        name={"visitBillable"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"visitDate"}
                  render={({ field }) => (
                    <FormRender label="Visit Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"therapistSignature"}
                  render={({ field }) => (
                    <FormRender label="Therapist Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"arrivalTime"}
                  render={({ field }) => (
                    <FormRender label="Arrival Time:">
                      <Input
                        {...field}
                        value={field.value as string}
                        type="time"
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"departureTime"}
                  render={({ field }) => (
                    <FormRender label="Departure Time:">
                      <Input
                        {...field}
                        value={field.value as string}
                        type="time"
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MILAGE</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"milesTravelled"}
                  render={({ field }) => (
                    <FormRender label="Miles Travelled:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">VITAL SIGNS</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"vitalSignsResp"}
                  render={({ field }) => (
                    <FormRender label="Resp:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"bloodPressure"}
                  render={({ field }) => (
                    <FormRender label="Blood Pressure:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"apicalPulse"}
                  render={({ field }) => (
                    <FormRender label="Apical Pulse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"lying"}
                  render={({ field }) => (
                    <FormRender label="Lying:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"radialPulse"}
                  render={({ field }) => (
                    <FormRender label="Radial Pulse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"standing"}
                  render={({ field }) => (
                    <FormRender label="Standing:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"weight"}
                  render={({ field }) => (
                    <FormRender label="Weight:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"sitting"}
                  render={({ field }) => (
                    <FormRender label="Sitting:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"temperature"}
                  render={({ field }) => (
                    <FormRender label="Temp:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">TREATMENT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatment"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "adl-Training", label: "ADL Training" },
                          { value: "bathing", label: "Bathing" },
                          { value: "dressing", label: "Dressing" },
                          { value: "grooming", label: "Grooming" },
                          { value: "feeding", label: "Feeding" },
                          {
                            value: "transfer-training",
                            label: "Transfer Training",
                          },
                          {
                            value: "muscle-re-education",
                            label: "Muscle Re-Education",
                          },
                          {
                            value: "established-upgrade-home",
                            label: "Established Upgrade Home Prog",
                          },
                          {
                            value: "perceptual-motor-training",
                            label: "Perceptual Motor Training",
                          },
                          {
                            value: "fine-motor-training",
                            label: "Fine Motor Training",
                          },
                          {
                            value: "neuro-development",
                            label: "Neuro Development",
                          },
                          {
                            value: "sensory-treatment",
                            label: "Sensory Treatment",
                          },
                          { value: "orthotics", label: "Orthotics/Splinting" },
                          {
                            value: "adaptive-equipment",
                            label: "Adaptive Equipment",
                          },
                          {
                            value: "therapeutic-exercises",
                            label: "Therapeutic Exercises",
                          },
                          {
                            value: "balance-activities",
                            label: "Balance Activities",
                          },
                          { value: "other", label: "Other" },
                        ]}
                        name={"treatment"}
                      />
                    </FormRender>
                  )}
                />

                {methods.watch("treatment")?.includes("other") && (
                  <FormField
                    control={methods.control}
                    name={"otherTreatment"}
                    render={({ field }) => (
                      <FormRender label={"Other"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">FUNCTIONAL IMPAIRMENTS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"functionalImpairment"}
                  render={({ field }) => (
                    <FormRender label="Functional Impairments:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isDyspneaOnExertion"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Dyspnea on Exertion</span>
                      </div>
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
                  name={"location"}
                  render={({ field }) => (
                    <FormRender label="Location:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"intensity"}
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
                  name={"duration"}
                  render={({ field }) => (
                    <FormRender label="Duration:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medication"}
                  render={({ field }) => (
                    <FormRender label="Medication:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                OBJECTIVE/SUBJECTIVE FINDINGS
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"subjectiveFindings"}
                  render={({ field }) => (
                    <FormRender>
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

export default History;
