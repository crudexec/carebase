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
import { speechEvaluation } from "@/constants/assessment";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData, validateVisitDate } from "@/lib";
import {
  evaluationDefaultValue,
  EvaluationForm,
  evaluationSchema,
} from "@/schema/assessment/st-eval/evaluation";
import { ObjectData } from "@/types";

const Evaluation = ({
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
  data?: EvaluationForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<EvaluationForm>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: evaluationDefaultValue,
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
            stEval: parseData({ ...assessment, evaluation: data }),
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
              <FormHeader className="mt-4">Cognition</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"orientation"}
                  render={({ field }) => (
                    <FormRender label="Orientation:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"attentionSpan"}
                  render={({ field }) => (
                    <FormRender label="Attention Span:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"shortTermMemory"}
                  render={({ field }) => (
                    <FormRender label="Short Term Memory:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"longTermMemory"}
                  render={({ field }) => (
                    <FormRender label="Long Term Memory:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"judgement"}
                  render={({ field }) => (
                    <FormRender label="Judgment:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"problemSolving"}
                  render={({ field }) => (
                    <FormRender label="Problem Solving:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`organization`}
                  render={({ field }) => (
                    <FormRender label="Organization:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherCognition`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`cognitionComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Speech/Voice</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"oralExam"}
                  render={({ field }) => (
                    <FormRender label="Oral/Facial Exam:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"articulation"}
                  render={({ field }) => (
                    <FormRender label="Articulation:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`prosody`}
                  render={({ field }) => (
                    <FormRender label="Prosody:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`voice`}
                  render={({ field }) => (
                    <FormRender label="Voice/Respiration:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`speechIntelligibility`}
                  render={({ field }) => (
                    <FormRender label="Speech Intelligibility:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherSpeech`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`speechComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Swallowing</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"chewingAbility"}
                  render={({ field }) => (
                    <FormRender label="Chewing Ability:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"oralStage"}
                  render={({ field }) => (
                    <FormRender label="Oral Stage Mgmt:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pharyngealStage`}
                  render={({ field }) => (
                    <FormRender label="Pharyngeal Stage Mgmt:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`reflexTime`}
                  render={({ field }) => (
                    <FormRender label="Reflex Time:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherSwallowing`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`swallowingComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Verbal Expression</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"augmentativeMethods"}
                  render={({ field }) => (
                    <FormRender label="Augmentative Methods:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"verbalExpressionNaming"}
                  render={({ field }) => (
                    <FormRender label="Naming:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`verbalExpressionAppropriate`}
                  render={({ field }) => (
                    <FormRender label="Appropriate:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`verbalExpressionComplexSentence`}
                  render={({ field }) => (
                    <FormRender label="Complex Sentences:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`verbalExpressionConversation`}
                  render={({ field }) => (
                    <FormRender label="Conversation:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`verbalExpressionComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Auditory Comprehension</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"wordDiscrimination"}
                  render={({ field }) => (
                    <FormRender label="Word Discrimination:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"oneStepDirections"}
                  render={({ field }) => (
                    <FormRender label="1 Step Directions:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`TwoStepDirections`}
                  render={({ field }) => (
                    <FormRender label="2 Step Directions:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`auditoryComprehensionComplexDirections`}
                  render={({ field }) => (
                    <FormRender label="Complex Directions:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`auditoryComprehensionConversation`}
                  render={({ field }) => (
                    <FormRender label="Conversation:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`speechReading`}
                  render={({ field }) => (
                    <FormRender label="Speech Reading:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`auditoryComprehensionComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Reading</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"readingLetter"}
                  render={({ field }) => (
                    <FormRender label="Letters/Numbers:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"readingWords"}
                  render={({ field }) => (
                    <FormRender label="Words:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`readingSimpleSentences`}
                  render={({ field }) => (
                    <FormRender label="Simple Sentences:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`readingComplexSentences`}
                  render={({ field }) => (
                    <FormRender label="Complex Sentences:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`readingParagraph`}
                  render={({ field }) => (
                    <FormRender label="Paragraph:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`readingComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Writing</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"writingLetter"}
                  render={({ field }) => (
                    <FormRender label="Letters/Numbers:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"writingWords"}
                  render={({ field }) => (
                    <FormRender label="Words:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`writingSentences`}
                  render={({ field }) => (
                    <FormRender label="Sentences:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`writingSpelling`}
                  render={({ field }) => (
                    <FormRender label="Spelling:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`writingFormulation`}
                  render={({ field }) => (
                    <FormRender label="Formulation:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`additionSubtraction`}
                  render={({ field }) => (
                    <FormRender label="Simple Addition/Subtraction:">
                      <SelectInput options={speechEvaluation} field={field} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`writingComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:" formClassName="lg:col-span-2">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">ADDITIONAL NOTES</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`additionalNotes`}
                  render={({ field }) => (
                    <FormRender>
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                EDUCATION/INSTRUCTION PROVIDED
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"instuctionProvided"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "safety", label: "Safety" },
                          { value: "exercise", label: "Exercise" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"instuctionProvide"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`instuctionProvidedComments`}
                  render={({ field }) => (
                    <FormRender label="Comments">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">STANDARD ASSESSMENT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"standardAssessmentUsed"}
                  render={({ field }) => (
                    <FormRender
                      label="Standard Assessment Used:"
                      formClassName="lg:col-span-2"
                    >
                      <RadioInput
                        className="flex-row gap-3 items-start"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`standardAssessmentComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`standardAssessmentResults`}
                  render={({ field }) => (
                    <FormRender label="Results:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"notifiedIdgType"}
                  render={() => (
                    <FormRender
                      label="Comments:"
                      formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "st-evaluation",
                            label: "Need for ST Evaluation",
                          },
                          {
                            value: "st-service",
                            label: "Need for Additional ST Services",
                          },
                        ]}
                        name={"notifiedIdgType"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`notifiedIdg`}
                  render={({ field }) => (
                    <FormRender label="Notified IDG:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"discplinesProvidingCare"}
                  render={() => (
                    <FormRender
                      label="Other Disciplines Providing Care:"
                      formClassName="flex lg:col-span-2 flex-wrap items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "SN", label: "SN" },
                          { value: "OT", label: "OT" },
                          { value: "PT", label: "PT" },
                          { value: "MSW", label: "MSW" },
                          { value: "OD", label: "OD" },
                          { value: "aide", label: "Aide" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"discplinesProvidingCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`discplinesProvidingCareComment`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`equipmentRecommendations`}
                  render={({ field }) => (
                    <FormRender label="Equipment Recommendations:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isChangesToPoc"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          There are no changes to POC based upon this assessment
                          at this time
                        </span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="lg:col-span-2">
                  <p className="text-sm font-semibold pb-2">
                    Was a need identified or reported during this assessment in
                    any of the following areas that requires a referral?
                  </p>
                  <FormField
                    control={methods.control}
                    name={"needReportedDuringAssessment"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "nutrition", label: "Nutrition" },
                            { value: "medications", label: "Medications" },
                            { value: "pain", label: "Pain" },
                            { value: "injuries", label: "Injuries/Wounds" },
                            {
                              value: "psychosocial-concerns",
                              label: "Psychosocial Concerns",
                            },
                            {
                              value: "self-care-skills",
                              label: "Self Care Skills",
                            },
                            { value: "IADL", label: "IADL's" },
                            {
                              value: "safety-issuess",
                              label: "Safety Issuess",
                            },
                            { value: "other", label: "Other" },
                          ]}
                          name={"needReportedDuringAssessment"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={`needReportedDuringAssessmentComment`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`refferalRecommendations`}
                  render={({ field }) => (
                    <FormRender label="Referral Recommendations:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">DISCHARGE DISCUSSED WITH</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dischargeDiscussedWith"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "patient", label: "Patient" },
                          { value: "family", label: "Family/Caregiver" },
                          { value: "care-manager", label: "Care Manager" },
                          { value: "physician", label: "Physician" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"discplinesProvidingCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`dischargeDiscussedWithComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">CARE COORDINATION</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"careCoordination"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "physician", label: "Physician" },
                          { value: "nursing", label: "Nursing" },
                          { value: "PT", label: "PT" },
                          { value: "OT", label: "OT" },
                          { value: "ST", label: "ST" },
                          { value: "MSW", label: "MSW" },
                          { value: "aide", label: "Aide" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"discplinesProvidingCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`careCoordinationComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PLAN OF THERAPY</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`planOfTherapyNextVisit`}
                  render={({ field }) => (
                    <FormRender label="Next Visit:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`planOfTherapyRecommendations`}
                  render={({ field }) => (
                    <FormRender label="Recommendations:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`planOfTherapyLongRangeGoals`}
                  render={({ field }) => (
                    <FormRender label="Long Range Goals:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`planOfTherapyShortRangeGoals`}
                  render={({ field }) => (
                    <FormRender label="Short Term Goals:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`planOfTherapyFrequency`}
                  render={({ field }) => (
                    <FormRender label="Frequency/Duration:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">THERAPIST SIGNATURE</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`therapistSignatureSignature`}
                  render={({ field }) => (
                    <FormRender label="Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`therapistSignatureDate`}
                  render={({ field }) => (
                    <FormRender label="Date:">
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MD/Physician SIGNATURE</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`physicianSignature`}
                  render={({ field }) => (
                    <FormRender label="Signature:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`physicianSignatureDate`}
                  render={({ field }) => (
                    <FormRender label="Date:">
                      <DateInput {...field} value={field.value as Date} />
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

export default Evaluation;
