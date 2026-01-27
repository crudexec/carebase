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
  careCoordinationDefaultValue,
  CareCoordinationForm,
  careCoordinationSchema,
} from "@/schema/assessment/st-visit/care-coordination";
import { ObjectData } from "@/types";

const CareCoordination = ({
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
  data?: CareCoordinationForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<CareCoordinationForm>({
    resolver: zodResolver(careCoordinationSchema),
    defaultValues: careCoordinationDefaultValue,
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
            stVisit: parseData({ ...assessment, careCoordination: data }),
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
            <div>
              <FormHeader className="mt-4">TREATMENT PROVIDED</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatmentProvided"}
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
                HOSPITAL RISK ASSESSMENT / NECESSARY INTERVENTION TO ADDRESS
                RISK
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`hospitalRiskAssessment`}
                  render={({ field }) => (
                    <FormRender label="Hospital Risk Assessment/Necessary Intervention To Address Risk">
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
                          { value: "NA", label: "N/A" },
                          { value: "DR", label: "Dr." },
                          { value: "RN", label: "RN" },
                          { value: "ST", label: "ST" },
                          { value: "STA", label: "STA" },
                          { value: "OT", label: "OT" },
                        ]}
                        name={"coordinationOfCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherCoordinationOfCare`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`coordinationOfCareRegard`}
                  render={({ field }) => (
                    <FormRender label="Regarding:">
                      <Input {...field} value={field.value as string} />
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
                <FormField
                  control={methods.control}
                  name={"isLastPhysician"}
                  render={({ field }) => (
                    <FormRender>
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
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PROCESS OF CARE MEASURES IDENTIFIED AND ADDRESSED THIS VISIT
              </FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"careMeasure"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "heart-failure ", label: "Heart Failure " },
                          {
                            value: "diabetic-foot-care",
                            label: "Diabetic Foot Care",
                          },
                          {
                            value: "clinically-significant",
                            label: "Clinically Significant Medication Issue",
                          },
                          {
                            value: "resk-for-pressure-ulcer",
                            label: "At Risk for Pressure Ulcer",
                          },
                          {
                            value: "wound-care",
                            label: "Moist Wound Care for Pressure Ulcer",
                          },
                          { value: "depression", label: "Depression" },
                          { value: "severe-pain", label: "Severe Pain" },
                          {
                            value: "high-risk-medications",
                            label: "High Risk Medications",
                          },
                          {
                            value: "risk-for-falls",
                            label: "At Risk For Falls",
                          },
                        ]}
                        name={"careMeasure"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"emergencyRoomVisit"}
                  render={({ field }) => (
                    <FormRender label="Emergency Room Visit:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`influenzaVaccine`}
                  render={({ field }) => (
                    <FormRender label="Influenza Vaccine:">
                      <DateInput {...field} value={field.value as Date} />
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
                  name={"pneumococcalVaccine"}
                  render={({ field }) => (
                    <FormRender label="Pneumococcal Vaccine:">
                      <DateInput {...field} value={field.value as Date} />
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
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">DISCHARGE PLAN</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"isDischargeNotice"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">5 Day Discharge Notice</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`dischargePlanSupervisor`}
                  render={({ field }) => (
                    <FormRender label="Supervisor:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">ST/STA SUPERVISION</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"staSupervision"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "satisfied-with-care",
                            label: "Patient/Caregiver Satisfied with Care",
                          },
                          {
                            value: "change-in-adl",
                            label: "Change in ADL Needs Assessment",
                          },
                          {
                            value: "care-provided",
                            label: "Care Provided According to Assessment",
                          },
                          {
                            value: "employee-courteous",
                            label: "Employee Courteous & Respectful",
                          },
                          {
                            value: "supervisory-visit-onsite",
                            label: "Supervisory Visit Onsite",
                          },
                        ]}
                        name={"staSupervision"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"employee"}
                  render={({ field }) => (
                    <FormRender label="Employee:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"employeeTitle"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "ST", label: "ST" },
                          { value: "STA", label: "STA" },
                        ]}
                        name={"employeeTitle"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"continueFrequency"}
                  render={({ field }) => (
                    <FormRender label="Continue Frequency at:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Object Evaluation</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"objectEvaluation"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Progress to Goal</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"progressToGoal"}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">COMMENTS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"comments"}
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

export default CareCoordination;
