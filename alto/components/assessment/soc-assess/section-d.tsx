"use client";
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
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import { SectionAForm } from "@/schema/assessment/soc-assess/section-a";
import { ObjectData } from "@/types";

const SectionD = ({
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
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm({
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
            socAccess: parseData({ ...assessment, sectionD: formData }),
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
                (D0150) 12.Patient Mood Interview (PHQ-2 to 9){" "}
              </FormHeader>
              <div className="grid gap-5">
                <div>
                  <p className="text-sm pb-2">
                    Interview questions for Patient
                  </p>
                  <div className="grid gap-5 border p-2">
                    <p className="text-sm font-semibold">
                      Say to patient: "Over the last 2 weeks, have you been
                      bothered by any of the following problems?"
                    </p>
                    <p className="text-sm font-semibold">
                      If symptom is present, enter 1 (yes) in column 1, Symptom
                      Presence.
                    </p>
                    <p className="text-sm font-semibold">
                      If yes in column 1, then ask the patient: "About how often
                      have you been bothered by this?"
                    </p>
                    <p className="text-sm font-semibold">
                      Read and show the patient a card with the symptom
                      frequency choices. Indicate response in column 2, Symptom
                      Frequency.
                    </p>
                  </div>
                </div>
                {[
                  {
                    title: "A.Little interest or pleasure in doing things",
                    key: "littleInterest",
                  },
                  {
                    title: "B. Feeling down, depressed, or hopeless",
                    key: "feelinDown",
                  },
                  {
                    title:
                      "C. Trouble falling or staying asleep, or sleeping too much",
                    key: "troubleFalling",
                    subTitle:
                      "If either D150A2 or D150B2 is coded 2 or 3, CONTINUE asking the questions below. If not, END the PHQ interview.",
                  },
                  {
                    title: "Feeling tired or having little energy",
                    key: "feelingTired",
                  },
                  {
                    title: "E. Poor appetite or overeating",
                    key: "poorAppetite",
                  },
                  {
                    title:
                      "F. Feeling bad about yourself – or that you are a failure or have let yourself or your family down",
                    key: "feelingBad",
                  },
                  {
                    title:
                      "G. Trouble concentrating on things, such as reading the newspaper or watching television",
                    key: "troubleConcentrating",
                  },
                  {
                    title:
                      "H. Moving or speaking so slowly that other people could have noticed. Or the opposite – being so fidgety or restless that you have been moving around a lot more than usual",
                    key: "movingSoSlowly",
                  },
                  {
                    title:
                      "I. Thoughts that you would be better off dead, or of hurting yourself in some way",
                    key: "thoughts",
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-sm font-semibold pb-2">{item.title}</p>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={`${item.key}SymptomsPresence`}
                        render={({ field }) => (
                          <FormRender
                            label="Symptom Presence"
                            className="!font-normal"
                          >
                            <SelectInput
                              allowClear
                              options={[
                                {
                                  value: "no",
                                  label: "No (enter 0 in column 2)",
                                },
                                {
                                  value: "yes",
                                  label: "Yes (enter 0-3 in column 2)",
                                },
                                {
                                  value: "no-response",
                                  label: "No response (Leave column 2 blank)",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.key}SymptomsFrequency`}
                        render={({ field }) => (
                          <FormRender
                            label="Symptom Frequency"
                            className="!font-normal"
                          >
                            <SelectInput
                              allowClear
                              options={[
                                { value: "never", label: "Never or 1 day" },
                                {
                                  value: "several-days",
                                  label: "2-6 days (several-days)",
                                },
                                {
                                  value: "more-of-days",
                                  label: "7-11 days (half or more of the days)",
                                },
                                {
                                  value: "nearly-everyday",
                                  label: "12-14 days (nearly every day)",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                    {item.subTitle && (
                      <p className="text-sm font-semibold pt-3">
                        {item.subTitle}
                      </p>
                    )}
                  </div>
                ))}
                <FormField
                  control={methods.control}
                  name={"totalSeverityScore"}
                  render={({ field }) => (
                    <FormRender label="(D0160) Total Severity Score:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">
                  Add scores for all frequency responses in Column 2, Symptom
                  Frequency. Total score must be between 00 and 27. Enter 99 if
                  unable to complete interview (i.e., Symptom Frequency is blank
                  for 3 or more required items)
                </p>
                <FormField
                  control={methods.control}
                  name={"socialIsolation"}
                  render={({ field }) => (
                    <FormRender label="(D0700) Social Isolation (How often do you feel lonely or isolated from those around you?)">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "Never", label: "Never" },
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

export default SectionD;
