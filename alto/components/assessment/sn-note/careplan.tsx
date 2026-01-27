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
import { parseData, validateVisitDate } from "@/lib";
import {
  carePlanDefaultValue,
  CarePlanForm,
  carePlanSchema,
} from "@/schema/assessment/sn-visit/careplan";
import { ObjectData } from "@/types";

const CarePlan = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  timeIn,
  timeOut,
  visitDate,
  isQA,
}: {
  assessmentId?: string;
  data?: CarePlanForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<CarePlanForm>({
    resolver: zodResolver(carePlanSchema),
    defaultValues: carePlanDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: sendTOQA,
    isMutating: sendingToQA,
    data: response2,
  } = useSaveAssessment();
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
    if (response2?.success) {
      toast.success("Data sent to QA successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response2]);

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

  const sendtoQA = async () => {
    if (validateVisitDate({ visitDate, timeIn, timeOut })) {
      await sendTOQA({
        nursingAssessment: parseData({
          ...assessment,
          cert485: methods.getValues(),
        }),
        patientScheduleId,
        caregiverId: authUser?.id as string,
        id: assessmentId,
        submittedAt: new Date(),
      });
    }
  };

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
            snVisit: parseData({ ...assessment, carePlan: data }),
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
                  <Button
                    className="px-6"
                    loading={sendingToQA}
                    variant="yellow"
                    type="button"
                    onClick={sendtoQA}
                  >
                    Send to QA
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
              <FormHeader className="mt-4">PHYSICIAN CONTACT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isPhysicianContact"}
                  render={({ field }) => (
                    <FormRender formClassName="self-center">
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
                  name={`physicianContactDiscussion`}
                  render={({ field }) => (
                    <FormRender label="Physician Contact Discussion:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                CLINICAL FINDINGS GOING TO 486 ADDENDUM
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isClinicalFinding"}
                  render={({ field }) => (
                    <FormRender formClassName="self-center">
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
                  name={`additionalFindings`}
                  render={({ field }) => (
                    <FormRender label="Additional Findings:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                NEW IDENTIFIED PROBLEMS/GOALS
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`newGoals`}
                  render={({ field }) => (
                    <FormRender label="New Problems/Goals:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <div>
              <FormHeader className="mt-4">
                PATIENT RESPONSE TO TEACHING
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dischargeNotice"}
                  render={() => (
                    <FormRender formClassName="flex items-center  flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "discharge-notice",
                            label: "5 Day Discharge Notice",
                          },
                          {
                            value: "discharge-goals",
                            label:
                              "Patient will be discharged when all goals met and skill services no longer required",
                          },
                        ]}
                        name={"dischargeNotice"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`dischargePlan`}
                  render={({ field }) => (
                    <FormRender label="Discharge Plan:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PROGRESS TOWARD GOALS ON POC
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`progressTowardsGoal`}
                  render={({ field }) => (
                    <FormRender label="Progress Toward Goals:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PLANS FOR NEXT VISIT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`plansForNextVisit`}
                  render={({ field }) => (
                    <FormRender label="Plans for Next Visit:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                LVN / LPN / HHN SUPERVISION
              </FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"hhnSupervision"}
                  render={() => (
                    <FormRender formClassName="flex items-center lg:col-span-2 flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "caregiver-satisfied",
                            label: "Patient/Caregiver Satisfied with Care",
                          },
                          {
                            value: "employee-courteous",
                            label: "Employee Courteous & Respectful",
                          },
                          {
                            value: "needs-assessment",
                            label: "Change in ADL Needs Assessment",
                          },
                          {
                            value: "supervisory-visit",
                            label: "Supervisory Visit Onsite",
                          },
                          {
                            value: "care-provided",
                            label: "Care Provided According to Assessment",
                          },
                        ]}
                        name={"hhnSupervision"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`continueFrequency`}
                  render={({ field }) => (
                    <FormRender label="Continue Frequency at:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`employee`}
                  render={({ field }) => (
                    <FormRender label="Employee:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"title"}
                  render={() => (
                    <FormRender
                      label="Title:"
                      formClassName="flex items-center lg:col-span-2  flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "LVN", label: "LVN/LPN" },
                          { value: "HHA", label: "HHA" },
                        ]}
                        name={"title"}
                      />
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
                    <FormRender formClassName="flex items-center lg:col-span-2 flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "RN", label: "RN" },
                          { value: "LVN", label: "LVN/LPN" },
                          { value: "therapist", label: "Therapist" },
                          { value: "physician", label: "Physician" },
                        ]}
                        name={"coordinationOfCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`lastPhysicianVisit`}
                  render={({ field }) => (
                    <FormRender label="Last Physician Visit:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`discussion`}
                  render={({ field }) => (
                    <FormRender label="Discussion:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PROCESS OF CARE MEASURES IDENTIFIED & ADDRESSED THIS VISIT
              </FormHeader>
              <div className="grid lg:grid-cols-2 gap-5 items-end">
                <FormField
                  control={methods.control}
                  name={"careMeasuredIdentify"}
                  render={() => (
                    <FormRender formClassName="flex items-center lg:col-span-2 flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "heart-failure", label: "Heart Failure" },
                          {
                            value: "risk-for-fall",
                            label: "At Risk For Falls",
                          },
                          { value: "foot-care", label: "Diabetic Foot Care" },
                          {
                            value: "pressure-ulcer",
                            label: "At Risk for Pressure Ulcer",
                          },
                          { value: "depression", label: "Depression" },
                          {
                            value: "moist-wound-care",
                            label: "Moist Wound Care For Pressure Ulcers",
                          },
                          { value: "severe-pain", label: "Severe Pain" },
                          {
                            value: "clinically-significant",
                            label: "Clinically Significant Medication Issue",
                          },
                          {
                            value: "high-risk-medications",
                            label: "High Risk Medications",
                          },
                        ]}
                        name={"careMeasuredIdentify"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`emergencyRoom`}
                  render={({ field }) => (
                    <FormRender
                      label="Emergency Room Visit Since Last Visit:"
                      formClassName="lg:col-span-2"
                    >
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`influenzaVaccine`}
                  render={({ field }) => (
                    <FormRender label="Influenza Vaccine Recieved Since Last Visit:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`influenzaVaccineGivenBy`}
                  render={({ field }) => (
                    <FormRender label="Given By:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pneumococcalVaccine`}
                  render={({ field }) => (
                    <FormRender label="Pneumococcal Vaccine Recieved Since Last Visit:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pneumococcalVaccineGivenBy`}
                  render={({ field }) => (
                    <FormRender label="Given By:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherMeasuredIdentify`}
                  render={({ field }) => (
                    <FormRender label="Other:" formClassName="lg:col-span-2">
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
              <Button
                className="px-6"
                loading={sendingToQA}
                variant="yellow"
                type="button"
                onClick={sendtoQA}
              >
                Send to QA
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

export default CarePlan;
