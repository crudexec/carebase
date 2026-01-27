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
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  sectionJDefaultValue,
  SectionJForm,
  sectionJSchema,
} from "@/schema/assessment/soc-assess/section-j";
import { ObjectData } from "@/types";

const SectionJ = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionJForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionJForm>({
    resolver: zodResolver(sectionJSchema),
    defaultValues: sectionJDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionJ: formData }),
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
            <FormHeader className="mt-4">HEALTH CONDITION</FormHeader>
            <div className="grid gap-5">
              <div>
                <p className="text-sm font-semibold pb-2">
                  (M1033) Risk for Hospitalization: Which of the following signs
                  or symptoms characterize this patient as at risk for
                  hopitalization? (Mark all that apply)
                </p>

                <FormField
                  control={methods.control}
                  name={"riskForHospilatization"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "history-of-fall",
                            label:
                              "History of falls (2 or more falls-or any fall with an injury-in the past 12 months)",
                          },
                          {
                            value: "unintentional-weight-loss",
                            label:
                              "Unintentional weight loss of a total of 10 pounds or more in the past 12 months",
                          },
                          {
                            value: "multiple-hospitalizations",
                            label:
                              "Multiple hospitalizations (2 or more) in the past 6 months",
                          },
                          {
                            value: "multiple-emergency",
                            label:
                              "Multiple emergency department visits (2 or more) in the past 6 months",
                          },
                          {
                            value: "decline-in-mental",
                            label:
                              "Decline in mental, emotional, or behavioral status in the past 3 months",
                          },
                          {
                            value: "observed-history",
                            label:
                              "Reported or observed history of difficulty complying with any medical instructions (for example: medications, diet, exercise) in the past 3 months",
                          },
                          {
                            value: "taking-medication",
                            label: "Currently taking 5 or more medications",
                          },
                          {
                            value: "reports-exhaustion",
                            label: "Currently reports exhaustion",
                          },
                          {
                            value: "other-risks",
                            label: "Other risk(s) not listed in 1-8",
                          },
                          { value: "none", label: "None of the above" },
                        ]}
                        name={"riskForHospilatization"}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"painEffectOnSleep"}
                render={({ field }) => (
                  <FormRender label="(J0510) Pain Effect on Sleep">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "does-not-apply",
                          label:
                            "Does not apply – I have not had any pain or hurting in the past 5 days (Skip to M1400), Short of Breath at SOC/ROC; Skip to J1800 Any Falls Since SOC/ROC at DC",
                        },
                        { value: "rarely", label: "Rarely or not at all" },
                        { value: "occasionally", label: "Occasionally" },
                        { value: "frequently", label: "Frequently" },
                        {
                          value: "almost-constantly",
                          label: "Almost constantly",
                        },
                        {
                          value: "unable-to-answer",
                          label: "Unable to answer",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"painInterferenceWithTherapy"}
                render={({ field }) => (
                  <FormRender label="(J0520) Pain Interference with Therapy Activities">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "does-not-apply",
                          label:
                            "Does not apply – I have not received rehabilitation therapy in the past 5 days",
                        },
                        { value: "rarely", label: "Rarely or not at all" },
                        { value: "occasionally", label: "Occasionally" },
                        { value: "frequently", label: "Frequently" },
                        {
                          value: "almost-constantly",
                          label: "Almost constantly",
                        },
                        {
                          value: "unable-to-answer",
                          label: "Unable to answer",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"painInterferenceWithDay"}
                render={({ field }) => (
                  <FormRender label="(J0530) Pain Interference with Day-to-Day Activities">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "rarely", label: "Rarely or not at all" },
                        { value: "occasionally", label: "Occasionally" },
                        { value: "frequently", label: "Frequently" },
                        {
                          value: "almost-constantly",
                          label: "Almost constantly",
                        },
                        {
                          value: "unable-to-answer",
                          label: "Unable to answer",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"patientDyspenic"}
                render={({ field }) => (
                  <FormRender label="(M1400) When is the patient dyspneic or noticeably short of breath?">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "short-of-breath",
                          label: "Patient is not short of breath",
                        },
                        {
                          value: "climbing-stairs",
                          label:
                            "When walking more than 20 feet, climbing stairs",
                        },
                        {
                          value: "with-moderate-exertion",
                          label:
                            "With moderate exertion (for example, while dressing, using commode or bedpan, walking distances less than 20 feet)",
                        },
                        {
                          value: "with-minmal-exertion",
                          label:
                            "With minimal exertion (for example, while eating, talking, or performing other ADLs) or with agitation",
                        },
                        {
                          value: "at-rest",
                          label: "At rest (during day or night)",
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

export default SectionJ;
