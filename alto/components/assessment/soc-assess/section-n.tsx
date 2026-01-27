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
  sectionNDefaultValue,
  SectionNForm,
  sectionNSchema,
} from "@/schema/assessment/soc-assess/section-n";
import { ObjectData } from "@/types";

const SectionN = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionNForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionNForm>({
    resolver: zodResolver(sectionNSchema),
    defaultValues: sectionNDefaultValue,
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
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({ ...assessment, sectionN: formData }),
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
            <FormHeader className="mt-4">MEDICATIONS</FormHeader>
            <div className="grid gap-5">
              <div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (N0415) High-Risk Drug Classes: Use and Indication
                  </p>
                  <p className="text-sm font-semibold pb-2">
                    1. Is Taking: Check if the patient is taking any medications
                    by pharmacological classification, not how it is used, in
                    the
                  </p>
                  <p className="text-sm font-semibold pb-2">
                    1. 2. Indication Noted:
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                  <div>
                    <p className="text-sm font-semibold pb-2">Antipsychotics</p>
                    <FormField
                      control={methods.control}
                      name={`antipsychotics`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`antipsychotics`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">Anticoagulant</p>
                    <FormField
                      control={methods.control}
                      name={`anticoagulant`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`anticoagulant`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">Antibiotic</p>
                    <FormField
                      control={methods.control}
                      name={`antibiotic`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`antibiotic`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">Opioid</p>
                    <FormField
                      control={methods.control}
                      name={`opioid`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`opioid`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">Antiplatelet</p>
                    <FormField
                      control={methods.control}
                      name={`antiplatelet`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`antiplatelet`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      Hypoglycemic (including insulin)
                    </p>
                    <FormField
                      control={methods.control}
                      name={`hypoglycemic`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`hypoglycemic`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      None of the above
                    </p>
                    <FormField
                      control={methods.control}
                      name={`none`}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "is-taking", label: "Is Taking" },
                              {
                                value: "indication-noted",
                                label: "Indication Noted",
                              },
                            ]}
                            name={`none`}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={methods.control}
                name={"drugRegimenReview"}
                render={({ field }) => (
                  <FormRender label="(M2001) Drug Regimen Review: Did a complete drug regimen review identify potential clinically significant medication issues?">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "no",
                          label:
                            "No issues found during review - (Go to M2010)",
                        },
                        {
                          value: "yes",
                          label: "Yes - Issues found during review",
                        },
                        {
                          value: "NA",
                          label:
                            "NA - Patient is not taking any medications - (Go to O0110)",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"medicationFollowUp"}
                render={({ field }) => (
                  <FormRender label="(M2003) Medication Follow-up: Did the agency contact a physician (or physician-designee) by midnight of the next calendar day and complete prescribed/recommended actions in response to the identified potential clinically significant medication issues?">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"riskDrugEducation"}
                render={({ field }) => (
                  <FormRender label="(M2010) Patient/Caregiver High Risk Drug Education: Has the patient/caregiver received instruction on special precautions for all high-risk medications (such as hypoglycemics, anticoagulants, etc) and how and when to report problems that may occur?">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                        {
                          value: "NA",
                          label:
                            "NA - Patient not taking any high risk drugs OR patient/caregiver fully knowledgeable about special precautions associated with all high-risk medications",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"educationProvided"}
                render={({ field }) => (
                  <FormRender label="Education Provided:">
                    <Input
                      {...field}
                      value={field.value as string}
                      placeholder="Name"
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"managementOfOralMedications"}
                render={({ field }) => (
                  <FormRender label="(M2020) Management of Oral Medications: Patient's current ability to prepare and take all oral medications reliably and safely, including administration of the correct dosage at the appropriate time/intervals. Excludes injectable and IV medication. (NOTE: This refers to ability, not compliance or willingness)">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "independently-take-medication",
                          label:
                            "Able to independently take the correct oral medication(s) and proper dosage(s) at the correct times",
                        },
                        {
                          value: "take-medication-if",
                          label:
                            "Able to take medication(s) at the correct times if  individual dosages are prepared in advance by another person OR another person develops a drug diary or chart",
                        },
                        {
                          value: "take-medication-with-supervision-at-times",
                          label:
                            "Able to take medication(s) at the correct times if given reminders by another person at the appropriate times",
                        },
                        {
                          value: "take-medication-with-supervision-all-time",
                          label:
                            "Unable to take medication unless adminstered by another person",
                        },
                        {
                          value: "NA",
                          label: "NA - No oral medication prescribed",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"managementOfInjectableMedications"}
                render={({ field }) => (
                  <FormRender label="(M2030) Management of Injectable Medications: Patient's current ability to prepare and take all prescribed injectable medications reliably and safely, including administration of correct dosage at the appropriate times/intervals. Excludes IV medications ">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "independently-take-medication",
                          label:
                            "Able to independently take the correct medication(s) and proper dosage(s) at the correct times",
                        },
                        {
                          value: "take-medication-if",
                          label:
                            "Able to take injectable medication(s) at the correct times if  individual syringes are prepared in advance by another person OR another person develops a drug diary or chart",
                        },
                        {
                          value: "take-medication-with-supervision-at-times",
                          label:
                            " Able to take medication(s) at the correct times if given reminders by another person based on the frequency of the injection",
                        },
                        {
                          value: "take-medication-with-supervision-all-time",
                          label:
                            "Unable to take injectable medication unless administered by another person",
                        },
                        {
                          value: "NA",
                          label: "NA - No injectable medication prescribed",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
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

export default SectionN;
