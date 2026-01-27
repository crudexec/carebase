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
} from "@/schema/assessment/ot-eval/treatment";
import { InformationForm } from "@/schema/assessment/st-eval/information";
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
  data?: InformationForm;
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
            otEval: parseData({ ...assessment, treatment: data }),
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
              <FormHeader className="mt-4">H AND P ORDER SUMMARY</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"orderSummary"}
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
                SUBJECTIVE/OBJECTIVE FINDINGS
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"subjectiveFinding"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">GOALS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"goals"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
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
            <div>
              <FormHeader className="mt-4">FREQUENCY/DURATION</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"frequency"}
                  render={({ field }) => (
                    <FormRender formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
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
                OCCUPATIONAL THERAPIST SIGNATURE/DATE OF VERBAL ORDER FOR
                OCCUPATIONAL THERAPY PLAN OF CARE
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"occupationalTherapistSignature"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">COORDINATION OF CARE</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
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
                          { value: "therapist", label: "Therapist" },
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
