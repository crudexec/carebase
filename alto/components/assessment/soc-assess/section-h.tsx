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
  sectionHDefaultValue,
  SectionHForm,
  sectionHSchema,
} from "@/schema/assessment/soc-assess/section-h";
import { ObjectData } from "@/types";

const SectionH = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionHForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionHForm>({
    resolver: zodResolver(sectionHSchema),
    defaultValues: sectionHDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionH: formData }),
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
              <FormHeader className="mt-4">BLADDER & BOWEL</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"patientTreatedForUrinaryInfection"}
                  render={({ field }) => (
                    <FormRender label="(M1600) Has this patient been treated for a Urinary Tract Infection in the past 14 days?">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "no", label: "No" },
                          { value: "yes", label: "Yes" },
                          {
                            value: "NA",
                            label: "NA - Patient on prophylactic treatment",
                          },
                          { value: "unknown", label: "UK - Unknown" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"urinaryIncontinence"}
                  render={({ field }) => (
                    <FormRender label="(M1610) Urinary Incontinence or Urinary Catheter Presence">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "no-incontinence",
                            label:
                              "No incontinence or catheter (includes anuria or ostomy for urinary drainage)",
                          },
                          {
                            value: "incontinence",
                            label: "Patient is incontinent",
                          },
                          {
                            value: "requires-urinary-catheter",
                            label:
                              "Patient requires a urinary catheter (specifically: external, indwelling, intermittent, suprapubic)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"bowelIncontinenceFrequency"}
                  render={({ field }) => (
                    <FormRender label="(M1620) Bowel Incontinence Frequency">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "very-rarely",
                            label:
                              "Very rarely or never has bowel incontinence",
                          },
                          {
                            value: "less-than-once-weekly",
                            label: "Less than once weekly",
                          },
                          {
                            value: "few-times-weekly",
                            label: "One to three times weekly",
                          },
                          {
                            value: "four-six-times-weekly",
                            label: "Four to six times weekly",
                          },
                          { value: "daily-basis", label: "On a daily basis" },
                          {
                            value: "more-than-once-daily",
                            label: "More often than once daily",
                          },
                          {
                            value: "NA",
                            label:
                              "NA - Patient has ostomy for bowel elimination",
                          },
                          { value: "unknown", label: "UK - Unknown" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"ostomyForBowelElimination"}
                  render={({ field }) => (
                    <FormRender label="(M1630) Ostomy for Bowel Elimination: Does this patient have an ostomy for bowel elimination that (within the last 14 days): a) was related to an inpatient facility stay, or b) necessitated a change in medical or treatment regimen? ">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "no-ostomy",
                            label:
                              "Patient does not have an ostomy for bowel elimination",
                          },
                          {
                            value: "ostomy-not-related-to-an-inpatient",
                            label:
                              "Patient's ostomy was not related to an inpatient stay and did not necessitate change in medical or treatment regimen",
                          },
                          {
                            value: "ostomy-related-to-an-inpatient",
                            label:
                              "The ostomy was related to an inpatient stay or did necessitate change in medical or treatment regimen",
                          },
                        ]}
                      />
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

export default SectionH;
