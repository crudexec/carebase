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
  informationDefaultValue,
  InformationForm,
  informationSchema,
} from "@/schema/assessment/st-eval/information";
import { ObjectData } from "@/types";

const Information = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: InformationForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<InformationForm>({
    resolver: zodResolver(informationSchema),
    defaultValues: informationDefaultValue,
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
            stEval: parseData({ ...assessment, information: data }),
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
              <FormHeader className="mt-4">VISIT</FormHeader>
              <div className="grid gap-5">
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
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PATIENT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"patientName"}
                  render={({ field }) => (
                    <FormRender label="Patient:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dob"}
                  render={({ field }) => (
                    <FormRender label="DOB:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"gender"}
                  render={({ field }) => (
                    <FormRender label="Gender:">
                      <SelectInput
                        allowClear
                        options={[
                          { label: "MALE", value: "Male" },
                          { label: "FEMALE", value: "Female" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"phone"}
                  render={({ field }) => (
                    <FormRender label="Phone:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"address"}
                  render={({ field }) => (
                    <FormRender label="Address:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"city"}
                  render={({ field }) => (
                    <FormRender label="City:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"state"}
                  render={({ field }) => (
                    <FormRender label="State:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"zip"}
                  render={({ field }) => (
                    <FormRender label="Zip:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">INSURANCE</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"patientId"}
                  render={({ field }) => (
                    <FormRender label="Patient ID:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherInsurance"}
                  render={({ field }) => (
                    <FormRender label="Other Insurance:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"insurance"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "A", label: "Part A" },
                          { value: "B", label: "Part B" },
                        ]}
                        name={"insurance"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">VISIT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"visitServiceProvided"}
                  render={({ field }) => (
                    <FormRender label="Service Provided:">
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          {
                            value: "initial-evaluation",
                            label: "Initial Evaluation",
                          },
                          { value: "re-evaluation", label: "Re-Evaluation" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"bill"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "billable", label: "Billable" },
                          { value: "non-billable", label: "Non-Billable" },
                        ]}
                        name={"bill"}
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
                  name={"therapist"}
                  render={({ field }) => (
                    <FormRender label="Therapist:">
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
                <FormField
                  control={methods.control}
                  name={"socDate"}
                  render={({ field }) => (
                    <FormRender label="SOC Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"onsetDate"}
                  render={({ field }) => (
                    <FormRender label="Onset Date:">
                      <DateInput {...field} value={field.value as Date} />
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
                  name={"temperature"}
                  render={({ field }) => (
                    <FormRender label="Temp:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"pulse"}
                  render={({ field }) => (
                    <FormRender label="Pulse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"resp"}
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
                  name={"usingO2At"}
                  render={({ field }) => (
                    <FormRender label="Using O2 at:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"lpmVia"}
                  render={({ field }) => (
                    <FormRender label="LPM via:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOMEBOUND STATUS</FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">
                  Describe the patient's functional status that renders him/her
                  homebound. Must meet Criteria One A or B and Criteria Two A &
                  B.
                </p>
                <FormField
                  control={methods.control}
                  name={`criteriaOneA`}
                  render={({ field }) => (
                    <FormRender label="Criteria One: A. Requires the assistance of supportive device, use of special transportation, or the assistance of another person to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaOneB`}
                  render={({ field }) => (
                    <FormRender label="Or B. Leaving the home is medically contraindicated (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaTwoA`}
                  render={({ field }) => (
                    <FormRender label="AND Criteria Two: A. There exists a normal inability to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaTwoB`}
                  render={({ field }) => (
                    <FormRender label="AND B. Leaving home requires a considerable taxing effort (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`medicalCare`}
                  render={({ field }) => (
                    <FormRender label="AND Absences from the home are infrequent, or relatively short duration, or to receive medical care (describe):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                HOSPITAL RISK ASSESSMENT / NECESSARY INTERVENTION TO ADRESS RISK
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`hospitalRiskAssessment`}
                  render={({ field }) => (
                    <FormRender label="Hospital Risk Assessment/Necessary Intervention To Adress Risk">
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

export default Information;
