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
  sectionADefaultValue,
  SectionAForm,
  sectionASchema,
} from "@/schema/assessment/soc-assess/section-a";
import { ObjectData } from "@/types";

const SectionA = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionAForm;
  mutate: () => void;
  assessment?: ObjectData;
  patientScheduleId: string;
  isQA: boolean;
}) => {
  const methods = useForm<SectionAForm>({
    resolver: zodResolver(sectionASchema),
    defaultValues: sectionADefaultValue,
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
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({ ...assessment, sectionA: formData }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
            visitDate: formData?.visitDate,
            timeIn: formData?.timeIn,
            timeOut: formData?.timeOut,
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
              <FormHeader className="mt-4">SERVICES</FormHeader>
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
                          {
                            value: "direct-care",
                            label: "Direct Care (wd, catheter, etc)",
                          },
                          {
                            value: "training",
                            label: "Training/Education (teaching)",
                          },
                          {
                            value: "observation",
                            label: "Observation/Assessment",
                          },
                          {
                            value: "RN",
                            label:
                              "M&E by RN (if specific orders for mgmt/eval)",
                          },
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
                  name={"serviceVisit"}
                  render={({ field }) => (
                    <FormRender label="Visit:">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "direct-visit", label: "Direct visit" },
                          { value: "tele-visit", label: "Tele visit" },
                          {
                            value: "video-conferencing",
                            label: "Video Conferencing",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PATIENT INFO</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"certificationNumber"}
                  render={({ field }) => (
                    <FormRender label="(M0010) CMS Certification Number:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"branchState"}
                  render={({ field }) => (
                    <FormRender label="(M0014) Branch State:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"branchId"}
                  render={({ field }) => (
                    <FormRender label="(M0016) Branch ID:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"attendingPhysician"}
                  render={({ field }) => (
                    <FormRender label="Attending Physician (who'll sign POC):">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"physicianNpi"}
                  render={({ field }) => (
                    <FormRender label="(M0018) Physician NPI:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"patientId"}
                  render={({ field }) => (
                    <FormRender label="(M0020) Patient ID:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"startOfCare"}
                  render={({ field }) => (
                    <FormRender label="(M0030) Start of Care:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"resumptionOfCare"}
                  render={({ field }) => (
                    <FormRender label="(M0032) Resumption of Care:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"firstName"}
                  render={({ field }) => (
                    <FormRender label="(M0040) First Name:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"patientMi"}
                  render={({ field }) => (
                    <FormRender label="(M0040) MI:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"lastName"}
                  render={({ field }) => (
                    <FormRender label="(M0040) Last Name:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"suffix"}
                  render={({ field }) => (
                    <FormRender label="(M0040) Suffix:">
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
                    <FormRender label="(M0050) State:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"zip"}
                  render={({ field }) => (
                    <FormRender label="(M0060) Zip:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medicareNumber"}
                  render={({ field }) => (
                    <FormRender label="(M0063) Medicare Number:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"ssn"}
                  render={({ field }) => (
                    <FormRender label="(M0064) SSN:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medicaidNumber"}
                  render={({ field }) => (
                    <FormRender label="(M0065) Medicaid Number:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dob"}
                  render={({ field }) => (
                    <FormRender label="(M0066) DOB:">
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
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"maritalStatus"}
                  render={({ field }) => (
                    <FormRender label="Marital Status:">
                      <SelectInput
                        allowClear
                        options={[
                          { value: "SINGLE", label: "Single" },
                          { value: "MARRIED", label: "Married" },
                          { value: "DIVORCED", label: "Divorced" },
                          { value: "WIDOWED", label: "Widowed" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                PATIENT ETHNICITY / RACE / LANGUAGE
              </FormHeader>
              <div className="grid gap-5">
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (A1005) Ethnicity (Are you of Hispanic, Latino/a, or Spanish
                    origin?)
                  </p>
                  <FormField
                    control={methods.control}
                    name={"ethnicity"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "not-hispanic",
                              label:
                                "No, not of Hispanic, Latino/a, or Spanish origin",
                            },
                            {
                              value: "mexican",
                              label:
                                "Yes, Mexican, Mexican American, Chicano/a",
                            },
                            {
                              value: "puerto-rican",
                              label: "Yes, Puerto Rican",
                            },
                            { value: "cuban", label: "Yes, Cuban" },
                            {
                              value: "another-hispanic",
                              label:
                                "Yes, Another Hispanic, Latino, or Spanish origin",
                            },
                            {
                              value: "patient-unable-to-respond",
                              label: "Patient unable to respond",
                            },
                            {
                              value: "patient-declines-to-respond",
                              label: "Patient declines to respond",
                            },
                          ]}
                          name={"ethnicity"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (A1010) Race (What is your race?)
                  </p>
                  <FormField
                    control={methods.control}
                    name={"race"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "white", label: "White" },
                            {
                              value: "black",
                              label: "Black or African American",
                            },
                            {
                              value: " American-indian",
                              label: " American Indian or Alaska Native",
                            },
                            { value: "asian-indian", label: "Asian Indian" },
                            { value: "chinese", label: "Chinese" },
                            { value: "filipino", label: "Filipino" },
                            { value: "japanese", label: "Japanese" },
                            { value: "korean", label: "Korean" },
                            { value: "vietnamese", label: "Vietnamese" },
                            { value: "other-asian", label: "Other Asian" },
                            {
                              value: "native-hawaiian",
                              label: "Native Hawaiian",
                            },
                            {
                              value: "guamanian",
                              label: "Guamanian or Chamorro",
                            },
                            { value: "samoan", label: "Samoan" },
                            {
                              value: "other-pacific-islander",
                              label: "Other Pacific Islander",
                            },
                            {
                              value: "patient-unable-to-respond",
                              label: "Patient unable to respond",
                            },
                            {
                              value: "patient-declines-to-respond",
                              label: "Patient declines to respond",
                            },
                            { value: "none", label: "None of the above" },
                          ]}
                          name={"race"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                COMMUNICATION & TRANSPORTATION
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"preferredLanguage"}
                  render={({ field }) => (
                    <FormRender label="A1110 A. What is your preferred language?">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"interpreter"}
                  render={({ field }) => (
                    <FormRender label="A1110 B. Do you need or want an interpreter to communicate with a doctor or health care staff?">
                      <RadioInput
                        className="flex-row  flex-wrap gap-3 items-start"
                        {...field}
                        options={[
                          { value: "no", label: "No" },
                          { value: "yes", label: "Yes" },
                          {
                            value: "unable-to-determine",
                            label: "Unable to determine",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (A1250) Transportation (Has lack of transportation kept you
                    from medical appointments, meetings, work, or from getting
                    things needed for daily living?)
                  </p>
                  <FormField
                    control={methods.control}
                    name={"transportation"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "medical-appointments",
                              label:
                                "Yes, it has kept me from medical appointments or from getting my medications",
                            },
                            {
                              value: "non-medical-meetings",
                              label:
                                "Yes, it has kept me from non-medical meetings, appointments, work, or from getting things that I need",
                            },
                            { value: "no", label: "No" },
                            {
                              value: "patient-unable-to-respond",
                              label: "Patient unable to respond",
                            },
                            {
                              value: "patient-declines-to-respond",
                              label: "Patient declines to respond",
                            },
                          ]}
                          name={"transportation"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">RACE / PAYMENT SOURCES</FormHeader>
              <div className="grid gap-5">
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (M0150) Current Payment Sources (Mark all that apply){" "}
                  </p>
                  <FormField
                    control={methods.control}
                    name={"currentPaymentSource"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "none",
                              label: "None, no charge for current services",
                            },
                            {
                              value: "medicare-traditional-fee",
                              label: "Medicare (Traditional fee for service)",
                            },
                            {
                              value: "medicare-managed-care",
                              label:
                                "Medicare (HMO/Managed Care, Advantage Plan)",
                            },
                            {
                              value: "medicaid-traditional-fee",
                              label: "Medicaid (Traditional fee for service)",
                            },
                            {
                              value: "medicaid-managed-care",
                              label: "Medicaid (HMO/Managed Care)",
                            },
                            {
                              value: "workers-compensation",
                              label: "Workers Compensation",
                            },
                            {
                              value: "title-programs",
                              label:
                                "Title Programs (e.g, Title III, V, or XX)",
                            },
                            {
                              value: "other-government",
                              label:
                                "Other Government (e.g, CHAMPUS, VA, etc.)",
                            },
                            {
                              value: "private-insurance",
                              label: "Private Insurance",
                            },
                            {
                              value: "private-managed-care",
                              label: "Private HMO/Managed Care",
                            },
                            { value: "self-pay", label: "Self pay" },
                            { value: "other", label: "Other" },
                            { value: "unknown", label: "UK. Unknown" },
                          ]}
                          name={"currentPaymentSource"}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                {methods.watch("currentPaymentSource")?.includes("other") && (
                  <FormField
                    control={methods.control}
                    name={"otherCurrentPaymentSource"}
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
              <FormHeader className="mt-4">
                CLINICAL RECORD ITEMS / DISCIPLINE
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"clinicalRecordItem"}
                  render={({ field }) => (
                    <FormRender label="(M0080) Discipline of Person Completing Assessment:">
                      <RadioInput
                        className="flex-row  flex-wrap gap-3 items-start"
                        {...field}
                        options={[
                          { value: "RN", label: "RN - Registered Nurse" },
                          { value: "PT", label: "PT - Physical Therapy" },
                          { value: "SLP", label: "SLP/ST - Speech Therapist" },
                          { value: "OT", label: "OT - Occupational Therapist" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">SOC / ROC VISIT DATE</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-2 gap-5">
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
                    name={"dateCompleted"}
                    render={({ field }) => (
                      <FormRender label="(M0090) Date Completed:">
                        <DateInput {...field} value={field.value as Date} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"timeIn"}
                    render={({ field }) => (
                      <FormRender label="Time In:">
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
                    name={"timeOut"}
                    render={({ field }) => (
                      <FormRender label="Time Out:">
                        <Input
                          {...field}
                          value={field.value as string}
                          type="time"
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isAssessmentPerformedMoreThanOne"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Assessments is performed over more than one visit date
                        </span>
                      </div>
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (M0100) This Assessment is currently being completed for the
                    following reason
                  </p>
                  <FormField
                    control={methods.control}
                    name={"socAssessment"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "start-of-care",
                              label: "Start of care - further visits planned",
                            },
                            {
                              value: "resumption-of-care",
                              label:
                                "Resumption of care (after inpatient stay)",
                            },
                          ]}
                          name={"socAssessment"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <p className="text-sm font-semibold">
                  (M0102) Date of Physician-ordered Start of Care (Resumption of
                  Care): If the physician indicated a specific start of care
                  (Resumption of Care) date when the patient was referred for
                  home health services, record the date specified
                </p>
                <FormField
                  control={methods.control}
                  name={"isNoSpecificSocDate"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          NA - No specific SOC date ordered by physician
                        </span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"socDateOfReferral"}
                  render={({ field }) => (
                    <FormRender label="(M0104) Date of Referral: Indicate the date that the written or verbal referral for initiation or resumption of care was received by the HHA :">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                EPISODE TIMING / ADMISSIONS SOURCE / SIGNATURES
              </FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"signatureCompleting"}
                    render={({ field }) => (
                      <FormRender label="Signature/Title of Discipline Completing:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"signatureCompletingDate"}
                    render={({ field }) => (
                      <FormRender label="Date Signed:">
                        <DateInput {...field} value={field.value as Date} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"signatureRivising"}
                    render={({ field }) => (
                      <FormRender label="Signature/Title of Discipline Revising:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"signatureRivisingDate"}
                    render={({ field }) => (
                      <FormRender label="Date Signed:">
                        <DateInput {...field} value={field.value as Date} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"milesTravelled"}
                    render={({ field }) => (
                      <FormRender label="Miles Travelled:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"electronicInitials"}
                    render={({ field }) => (
                      <FormRender label="PT/RN Electronic Initials:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"episodeTiming"}
                  render={({ field }) => (
                    <FormRender label="(M0110) Episode Timing: Is the Medicare home health payment episode for which this assessment will define a case mix group an 'early' episode or a 'later' episode in the patient's current sequence of adjacent Medicare home health payment episodes?">
                      <RadioInput
                        className="flex-row  flex-wrap gap-3 items-start"
                        {...field}
                        options={[
                          { value: "early", label: "Early" },
                          { value: "later", label: "Later" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"patientAdmissionSource"}
                  render={({ field }) => (
                    <FormRender label="Patient Admission Source:">
                      <SelectInput
                        allowClear
                        options={[
                          { value: "INSTITUTIONAL", label: "Institutional" },
                          { value: "COMMUNITIY", label: "Communitiy" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (M1000) From which of the following Inpatient Facilities was
                    the patient discharged within the past 14 days? (Mark all
                    the apply)
                  </p>
                  <FormField
                    control={methods.control}
                    name={"inpatientFacilities"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "long-term-nursing",
                              label: "Long-term nursing facility (NF",
                            },
                            {
                              value: "skilled-nursing",
                              label: "Skilled nursing facility (SNF/TCU)",
                            },
                            {
                              value: "short-stay",
                              label: "Short-stay acute hospital (IPP S)",
                            },
                            {
                              value: "long-term-acute",
                              label: "Long-term care hospital (LTCH)",
                            },
                            {
                              value: "inpatient-rehabilitation-hospital",
                              label:
                                "Inpatient rehabilitation hospital or unit (IRF)",
                            },
                            {
                              value: "psychiatric-hospital",
                              label: "Psychiatric hospital or unit",
                            },
                            { value: "other", label: "Other" },
                            {
                              value: "NA",
                              label:
                                "NA - Patient was not discharged from inpatient facility (Go to M1021)",
                            },
                          ]}
                          name={"inpatientFacilities"}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                {methods.watch("inpatientFacilities")?.includes("other") && (
                  <FormField
                    control={methods.control}
                    name={"otherInpatientFacilities"}
                    render={({ field }) => (
                      <FormRender label={"Other"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}
                <FormField
                  control={methods.control}
                  name={"inpatientDischargeDate"}
                  render={({ field }) => (
                    <FormRender label="(M1005) Inpatient Discharge Date (most recent)">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isUnknown"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">UK - Unknown</span>
                      </div>
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

export default SectionA;
