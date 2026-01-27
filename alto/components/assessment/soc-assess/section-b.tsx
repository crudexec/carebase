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
  sectionBDefaultValue,
  SectionBForm,
  sectionBSchema,
} from "@/schema/assessment/soc-assess/section-b";
import { ObjectData } from "@/types";

const SectionB = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionBForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionBForm>({
    resolver: zodResolver(sectionBSchema),
    defaultValues: sectionBDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionB: formData }),
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
              <FormHeader className="mt-4">
                HEARING / VISION / HEALTH LITRACY
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"hearing"}
                  render={({ field }) => (
                    <FormRender label="(B0200) Hearing: Ability to hear (with hearing aid or hearing appliances if normally used):">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "adequate",
                            label:
                              "Adequate - no difficulty in normal conversation, social interaction, listening to TV",
                          },
                          {
                            value: "minimal-difficulty",
                            label:
                              "Minimal difficulty - difficulty in some environments (e.g., when person speaks softly, or setting is noisy)",
                          },
                          {
                            value: "moderate-difficulty",
                            label:
                              "Moderate difficulty - speaker has to increase volume and speak distinctly",
                          },
                          {
                            value: "highly-impaired",
                            label:
                              "Highly impaired - absence of useful hearing",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vision"}
                  render={({ field }) => (
                    <FormRender label="(B1000) Vision: Ability to see in adequate light (with glasses or other visual appliances): ">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "adequate",
                            label:
                              "Adequate - sees fine detail, such as regular print in newspapers/books",
                          },
                          {
                            value: "impaired",
                            label:
                              "Impaired - sees large print, but not regular print in newspapers/books",
                          },
                          {
                            value: "moderate-difficulty",
                            label:
                              "Moderate impaired - limited vision; not able to see newspaper headlines but can identify objectsy",
                          },
                          {
                            value: "highly-impaired",
                            label:
                              "Highly impaired - object identification in question, but eyes appear to follow objects",
                          },
                          {
                            value: "severely-impaired",
                            label:
                              "Severely impaired - no vision or sees only light, colors or shapes; eyes do not appear to follow objects",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"health"}
                  render={({ field }) => (
                    <FormRender label="(B1300) Health Literacy: How often do you need to have someone help you when you read instructions, pamphlets, or other written material from yourdoctor or pharmacy?">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "never", label: "Never" },
                          { value: "rarely", label: "Rarely" },
                          { value: "sometimes", label: "Sometimes" },
                          { value: "often", label: "Often" },
                          { value: "always", label: "Always" },
                          {
                            value: "patient-unable-to-respond",
                            label: "Patient unable to respond",
                          },
                          {
                            value: "patient-declines-to-respond",
                            label: "Patient declines to respond",
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

export default SectionB;
