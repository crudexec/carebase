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
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  sectionCDefaultValue,
  SectionCForm,
  sectionCSchema,
} from "@/schema/assessment/soc-assess/section-c";
import { ObjectData } from "@/types";

const SectionC = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionCForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionCForm>({
    resolver: zodResolver(sectionCSchema),
    defaultValues: sectionCDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionC: formData }),
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
              <FormHeader className="mt-4">Cognitive Patterns</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"interviewForMentalStatus"}
                  render={({ field }) => (
                    <FormRender label="(C0100) Should Brief Interview for Mental Status (C0200-C0500) be Conducted?">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "no",
                            label:
                              "No (patient is rarely/never understood) (Skip to C1310 Signs and Symptoms of Delirium (from CAM-copyright))",
                          },
                          {
                            value: "yes",
                            label:
                              "Yes (Continue to C0200, Repetition of Three Words)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            {methods.watch("interviewForMentalStatus")?.includes("yes") && (
              <div>
                <FormHeader className="mt-4">
                  Brief Interview for Mental Status (BIMS)
                </FormHeader>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">
                    (C0200) Repetition of Three Words{" "}
                  </p>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      Ask patient: "I am going to say three words for you to
                      remember. Please repeat the words after I have said all
                      three. The words are: sock, blue, and bed. Now tell me the
                      three words."
                    </p>
                    <FormField
                      control={methods.control}
                      name={"numberOfWordsRepeated"}
                      render={({ field }) => (
                        <FormRender label="Number of words repeated after first attempt">
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "none", label: "None" },
                              { value: "one", label: "One" },
                              { value: "two", label: "Two" },
                              { value: "three", label: "Three" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                    <p className="text-sm font-semibold pt-2">
                      After the patient's first attempt, repeat the words using
                      cues ("sock, something to wear; blue, a color; bed, a
                      piece of furniture"). You may repeat the words up to two
                      more times.
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    (C0300) Temporal Orientation{" "}
                  </p>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      Ask patient: "Please tell me what year it is right now."
                    </p>
                    <FormField
                      control={methods.control}
                      name={"ableToReportCorrectYear"}
                      render={({ field }) => (
                        <FormRender label="A. Able to report correct year">
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              {
                                value: "0",
                                label: "Missed by > 5 years or no answer",
                              },
                              { value: "1", label: "Missed by 2-5 years" },
                              { value: "2", label: "Missed by 1 year" },
                              { value: "3", label: "Correct" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      Ask patient: "What month are we in right now?"
                    </p>
                    <FormField
                      control={methods.control}
                      name={"ableToReportCorrectMonth"}
                      render={({ field }) => (
                        <FormRender label="B. Able to report correct month">
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              {
                                value: "0",
                                label: "Missed by > 1 month or no answer",
                              },
                              {
                                value: "1",
                                label: "Missed by 6 days to 1 month",
                              },
                              { value: "2", label: "Accurate within 5 days" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold pb-2">
                      Ask patient: "What day of the week is today?"
                    </p>
                    <FormField
                      control={methods.control}
                      name={"ableToReportCorrectDay"}
                      render={({ field }) => (
                        <FormRender label="C. Able to report correct day of the week">
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              {
                                value: "incorrect",
                                label: "Incorrect or no answer",
                              },
                              { value: "correct", label: "Correct" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <p className="text-sm font-semibold">(C0400) Recall</p>
                  <p className="text-sm font-semibold">
                    Ask patient: "Let's go back to an earlier question. What
                    were those three words that I asked you to repeat?" If
                    unable to remember a word, give cue (something to wear; a
                    color; a piece of furniture) for that word.
                  </p>
                  <FormField
                    control={methods.control}
                    name={"ableToRecallSocks"}
                    render={({ field }) => (
                      <FormRender label='A. Able to recall "sock"'>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "no", label: "No - could not recall" },
                            {
                              value: "yes-after-cueing",
                              label: 'Yes, after cueing ("something to wear")',
                            },
                            {
                              value: "yes-without-cueing",
                              label: "Yes, no cue required",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"ableToRecallBlue"}
                    render={({ field }) => (
                      <FormRender label='A. Able to recall "blue"'>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "no", label: "No - could not recall" },
                            {
                              value: "yes-after-cueing",
                              label: 'Yes, after cueing ("a color")',
                            },
                            {
                              value: "yes-without-cueing",
                              label: "Yes, no cue required",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"ableToRecallBed"}
                    render={({ field }) => (
                      <FormRender label='A. Able to recall "bed"'>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "no", label: "No - could not recall" },
                            {
                              value: "yes-after-cueing",
                              label:
                                'Yes, after cueing  ("a piece of furniture")',
                            },
                            {
                              value: "yes-without-cueing",
                              label: "Yes, no cue required",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"bimSummaryScore"}
                    render={({ field }) => (
                      <FormRender label="(C0500) BIMS Summary Score">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm lg:flex-1">
                            Add scores for questions C0200-C0400 and fill in
                            total score (00-15) Enter 99 if the patient was
                            unable to complete the interview
                          </p>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            )}
            <div>
              <FormHeader className="mt-4">
                (C1310) Signs and Symptoms of Delirium (from CAMï¿½)
              </FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">
                  Code after completing Brief Interview for Mental Status and
                  reviewing medical record.
                </p>
                <FormField
                  control={methods.control}
                  name={"acuteOnset"}
                  render={({ field }) => (
                    <FormRender label="A. Acute Onset of Mental Status Change">
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
                  name={"inattention"}
                  render={({ field }) => (
                    <FormRender label="B. Inattention - Did the patient have difficulty focusing attention, for example, being easily distractible or having difficulty keeping track of what was being">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "behavior-not-present",
                            label: "Behavior not present",
                          },
                          {
                            value: "behavior-continuously-present",
                            label:
                              "Behavior continuously present, does not fluctuate",
                          },
                          {
                            value: "behavior-present-fluctuates",
                            label:
                              "Behavior present, fluctuates (comes and goes, changes in severity)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"disorganisedThinking"}
                  render={({ field }) => (
                    <FormRender label="C. Disorganized thinking - Was the patient's thinking disorganized or incoherent (rambling or irrelevant conversation, unclear or illogical flow of ideas, or unpredictable switching from subject to subject)?">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "behavior-not-present",
                            label: "Behavior not present",
                          },
                          {
                            value: "behavior-continuously-present",
                            label:
                              "Behavior continuously present, does not fluctuate",
                          },
                          {
                            value: "behavior-present-fluctuates",
                            label:
                              "Behavior present, fluctuates (comes and goes, changes in severity)",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <div className="text-sm font-semibold flex flex-col gap-2">
                  <p>
                    Altered level of consciousness - Did the patient have
                    altered level of consciousness, as indicated by any of the
                    following criteria? Vigilant - startled easily to any sound
                    or touch
                  </p>
                  <p>Vigilant - startled easily to any sound or touch</p>
                  <p>
                    Lethargic - repeatedly dozed off when being asked questions,
                    but responded to voice or touch
                  </p>
                  <p>
                    Stuporous - very difficult to arouse and keep aroused for
                    the interview
                  </p>
                  <p>Comatose - could not be aroused</p>
                  <FormField
                    control={methods.control}
                    name={"alteredLevelOfConsicousness"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            {
                              value: "behavior-not-present",
                              label: "Behavior not present",
                            },
                            {
                              value: "behavior-continuously-present",
                              label:
                                "Behavior continuously present, does not fluctuate",
                            },
                            {
                              value: "behavior-present-fluctuates",
                              label:
                                "Behavior present, fluctuates (comes and goes, changes in severity)",
                            },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"cognitiveFunctioning"}
                  render={({ field }) => (
                    <FormRender label="(M1700) Cognitive Functioning Patient's current (day of assessment) level of alertness, orientation, comprehension, concentration, and immediate memory of simple commands ">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "alert",
                            label:
                              " Alert/oriented, able to focus and shift attention, comprehends & recall task directions independently",
                          },
                          {
                            value: "requires-prompting",
                            label:
                              "Requires prompting (cueing, repetition, reminders) only under stressful or unfamiliar conditions",
                          },
                          {
                            value: "requires-assistance",
                            label:
                              "Requires assistance and some direction in specific situations (for example: on all tasks involving shifting of attention), or consistently requires low stimulus environment due to distractibility",
                          },
                          {
                            value: "requires-considerable-assistance",
                            label:
                              "Requires considerable assistance in routine situations. Is not alert and oriented or is unable to shift attention and recall directions more than half the time",
                          },
                          {
                            value: "totally-dependent",
                            label:
                              "Totally dependent due to disturbances such as constant disorientation, coma, persistent vegetative state, or delirium",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"whenConfused"}
                  render={({ field }) => (
                    <FormRender label="(M1710) When Confused (Reported or Observed Within the last 14 days)">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "never", label: "Never" },
                          {
                            value: "in-new",
                            label: "In new or complex situations only",
                          },
                          {
                            value: "on-awakening",
                            label: "On awakening or at night only",
                          },
                          {
                            value: "during-the-day-and-evening",
                            label:
                              "During the day and evening, but not constantly",
                          },
                          { value: "constantly", label: "Constantly" },
                          { value: "NA", label: "NA - Patient nonresponsive" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"whenAnxious"}
                  render={({ field }) => (
                    <FormRender label="(M1720) When Anxious (Reported or Observed Within the Last 14 Days)">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "none", label: "None of the time" },
                          {
                            value: "less-often",
                            label: "Less often than daily",
                          },
                          {
                            value: "daily-not-constant",
                            label: "Daily, but not constantly",
                          },
                          {
                            value: "all-of-the-time",
                            label: "All of the time",
                          },
                          { value: "NA", label: "NA - Patient nonresponsive" },
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

export default SectionC;
