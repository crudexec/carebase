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
  sectionKDefaultValue,
  SectionKForm,
  sectionKSchema,
} from "@/schema/assessment/soc-assess/section-k";
import { ObjectData } from "@/types";

const SectionK = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionKForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionKForm>({
    resolver: zodResolver(sectionKSchema),
    defaultValues: sectionKDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionK: formData }),
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
            <FormHeader className="mt-4">SWALLOWING / NUTRITION</FormHeader>
            <div className="grid gap-5">
              <p className="text-sm font-semibold">
                (M1060) Height and Weight - While measuring, if the number is
                X.1 - X.4 round down; X.5 or greater round up:
              </p>
              <FormField
                control={methods.control}
                name={"height"}
                render={({ field }) => (
                  <FormRender label="a. Height (in inches). Record most recent height measure since the most recent SOC/ROC:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"weight"}
                render={({ field }) => (
                  <FormRender label="b. Weight (in pounds). Base weight on most recent measure in last 30 days; measure weight consistently, according to standard agency practice (for example, in a.m. after voiding, before meal, with shoes off, etc.):">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <div>
                <p className="text-sm font-semibold pb-2">
                  (K0520)Nutritional Approaches
                </p>
                <FormField
                  control={methods.control}
                  name={"nutritionalApproaches"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "iv-feeding",
                            label: "Parenteral/IV feeding",
                          },
                          {
                            value: "feeding-tube",
                            label:
                              "Feeding tube (e.g., nasogastric or abdominal (PEG))",
                          },
                          {
                            value: "mechanically-altered-diet",
                            label:
                              "Mechanically altered diet - require change in texture of food or liquids (e.g., pureed food, thickened liquids)",
                          },
                          {
                            value: "therapeutic-tube",
                            label:
                              "Therapeutic diet (e.g., low salt, diabetic, low cholesterol)",
                          },
                          { value: "none", label: "None of the above" },
                        ]}
                        name={"nutritionalApproaches"}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"eating"}
                render={({ field }) => (
                  <FormRender label="(M1870) Feeding or Eating: Current ability to feed self meals and snacks safely. Note: This refers only to the process of eating, chewing, and swallowing, not preparing the food to be eaten">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "feed-independently",
                          label: "Able to independently feed self",
                        },
                        {
                          value: "able-to-feed-independently-or-assisted",
                          label:
                            "Able to feed self independently through meal setup or intermittent assistance or supervision from another person or a liquid, pureed or ground meat diet",
                        },
                        {
                          value: "assisted-to-feed",
                          label:
                            "Unable to feed self and must be assisted or supervised throughout the meal/snack",
                        },
                        {
                          value: "eat-nutrient-orally",
                          label:
                            "Able to take in nutrients orally and receives supplemental nutrients through a nasogastric tube or gastrostomy",
                        },
                        {
                          value: "feed-through-nasogastric-tube",
                          label:
                            "Unable to take in nutrients orally and is fed nutrients through a nasogastric tube or gastrostomy",
                        },
                        {
                          value: "unable-to-eat-orally",
                          label:
                            "Unable to take in nutrients orally or by tube feeding",
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

export default SectionK;
