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
  sectionEDefaultValue,
  SectionEForm,
  sectionESchema,
} from "@/schema/assessment/soc-assess/section-e";
import { ObjectData } from "@/types";

const SectionE = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionEForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionEForm>({
    resolver: zodResolver(sectionESchema),
    defaultValues: sectionEDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionE: formData }),
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
              <FormHeader className="mt-4">BEHAVIOUR</FormHeader>
              <div className="grid gap-5">
                <div>
                  <p className="text-sm font-semibold pb-2">
                    (M1740) Cognitive, behavioral, and psychiatric symptoms that
                    are demonstrated at least once a week(Reported or Observed)
                    - (Mark all that apply)
                  </p>
                  <FormField
                    control={methods.control}
                    name={"cognitive"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "memory-deficit",
                              label:
                                " Memory deficit: failure to recognize familiar persons/places, inability to recall events of past 24 hours, significant memory loss so that supervision is required",
                            },
                            {
                              value: "impaired-decision",
                              label:
                                "Impaired decision-making: failure to perform usual ADLs or IADLs, inability to appropriately stop activities, jeopardizes safety through actions",
                            },
                            {
                              value: "verbal-disruption",
                              label:
                                "Verbal disruption: yelling, threatening, excessive profanity, sexual references, etc",
                            },
                            {
                              value: "physical-aggression",
                              label:
                                "Physical aggression: aggressive or combative to self and others (for example: hits self, throws objects, punches, dangerous maneuvers with wheelchair or other objects)",
                            },
                            {
                              value: "disruptive",
                              label:
                                "Disruptive, infantile, or socially inappropriate behavior (excludes verbal actions)",
                            },
                            {
                              value: "delutional",
                              label:
                                "Delusional, hallucinatory, or paranoid behavior",
                            },
                            {
                              value: "none",
                              label: "None of the above behaviors demonstrated",
                            },
                          ]}
                          name={"cognitive"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"frequency"}
                  render={({ field }) => (
                    <FormRender label="(M1745) Frequency of Disruptive Behavior Symptoms (Reported or Observed) Any physical, verbal, or other disruptive/dangerous symptoms that are injurious to self or others or jeopardize personal safety">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "Never", label: "Never" },
                          {
                            value: "less-than-a-month",
                            label: "Less than once a month",
                          },
                          { value: "once-a-month", label: "Once a month" },
                          {
                            value: "several-time-each-month",
                            label: "Several time each month",
                          },
                          {
                            value: "several-times-a-week",
                            label: "Several times a week",
                          },
                          { value: "at-least-daily", label: "At least daily" },
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

export default SectionE;
