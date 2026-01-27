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
  DateInput,
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
import { cn, parseData, validateVisitDate } from "@/lib";
import {
  tinettiDefaultValue,
  TinettiForm,
  tinettiSchema,
} from "@/schema/assessment/pt-eval/tinetti";
import { ObjectData } from "@/types";

const Tinetti = ({
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
  data?: TinettiForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm<TinettiForm>({
    resolver: zodResolver(tinettiSchema),
    defaultValues: tinettiDefaultValue,
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
            ptEval: parseData({ ...assessment, tinetti: data }),
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
            <div className="grid lg:grid-cols-2 gap-5 mt-4">
              <FormField
                control={methods.control}
                name={"name"}
                render={({ field }) => (
                  <FormRender label="Name:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"date"}
                render={({ field }) => (
                  <FormRender label="Date:">
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <FormHeader className="mt-4">Balance Assessment</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-4 gap-5 text-sm font-semibold bg-secondary p-3">
                  <p>Task</p>
                  <p>Description of Balance</p>
                  <p>Possible</p>
                  <p>Score</p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Sitting Balance</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Leans or slides in chair</li>
                    <li>(1) Steady,safe</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"sittingBalance"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("sittingBalance") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("sittingBalance")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Rises From Chair</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unable to rise without help</li>
                    <li>(1) Able to rise using arms to help</li>
                    <li>(2) Able to rise without using arms to help</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"risesFromChair"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "block",
                      !methods.watch("risesFromChair") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("risesFromChair")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Attempts To Rise</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unable to rise without help</li>
                    <li>(1) Able to rise, requires more than one attempt</li>
                    <li>(2) Able to rise, requires one attempt</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"attemptsToRise"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("attemptsToRise") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("attemptsToRise")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Immedate Standing Balance(first 5 seconds)</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unsteady(staggers,moves feet,trunk sways)</li>
                    <li>(1) Steady,but uses walker or other support</li>
                    <li>(2) Steady without walker or other support</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"immediateStandingBalance"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("immediateStandingBalance") &&
                        "hidden lg:block",
                    )}
                  >
                    {methods.watch("immediateStandingBalance")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Standing Balance</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unsteady</li>
                    <li>(1) Steady,but with wide stance and uses support</li>
                    <li>(2) Narrow stance without support</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"standingBalance"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("standingBalance") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("standingBalance")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Nudged</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Begins to fall</li>
                    <li>(1) Staggers,grabs,catches self</li>
                    <li>(2) Steady</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"nudged"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("nudged") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("nudged")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Eyes Closed</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unsteady</li>
                    <li>(1) Steady</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"eyesClosed"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("eyesClosed") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("eyesClosed")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Turning 360 Degrees</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Discontinuous Steps</li>
                    <li>(1) Continuous Steps</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"turning360Degree"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("turning360Degree") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("turning360Degree")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Turning 360 Degrees Steadiness</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Leans or slides in chair</li>
                    <li>(1) Steady,safe</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"turning360DegreeSteadiness"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("turning360DegreeSteadiness") &&
                        "hidden lg:block",
                    )}
                  >
                    {methods.watch("turning360DegreeSteadiness")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Sitting Down(Getting Seated)</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Unsafe(misjudged distance,falls into chair)</li>
                    <li>(1) Uses arms or not a smooth motion</li>
                    <li>(2) Safe,smooth motion</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"sittingDown"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("sittingDown") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("sittingDown")}
                  </p>
                </div>
                <p className="text-lg font-semibold text-center border-b">
                  () Total Score (Maximum =16)
                </p>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Gait Assessment</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-4 gap-5 text-sm font-semibold bg-secondary p-3">
                  <p>Task</p>
                  <p>Description of Gait</p>
                  <p>Possible</p>
                  <p>Score</p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Indication of Gait</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Any hesitancy or multiple attempts</li>
                    <li>(1) No hesitancy</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"indicationOfGait"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("indicationOfGait") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("indicationOfGait")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Step Length & Height</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Step to</li>
                    <li>(1) Step through right</li>
                    <li>(2) Safe,smooth motion</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"stepLength"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("stepLength") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("stepLength")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Foot Clearance</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Foot drop</li>
                    <li>(1) Left foot clears the floor</li>
                    <li>(2) Right foot clears the floor</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"footClearance"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("footClearance") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("footClearance")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Step Symmetry</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Right and left step length are not equal</li>
                    <li>(1) Right and left step length appear equal</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"stepSymmetry"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("stepSymmetry") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("stepSymmetry")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Step Continuity</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Stopping of discontinuity between steps</li>
                    <li>(1) Steps appear continuous</li>
                    <li>(2) Safe,smooth motion</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"stepContinuity"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("stepContinuity") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("stepContinuity")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Path</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Marked deviation</li>
                    <li>(1) Mild/moderate deviation or uses a walking aid</li>
                    <li>(2) Straight without a walking aid</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"path"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("path") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("path")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Trunk</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Marked sway or uses a walking aid</li>
                    <li>(1) No sway,flexes knees/back/uses arms to balance</li>
                    <li>
                      (2) No sway,no flexion of knees or back use of arms,or
                      walking aid
                    </li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"trunk"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("trunk") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("trunk")}
                  </p>
                </div>
                <div className="grid lg:grid-cols-4 gap-5 items-start text-sm pb-5 border-b">
                  <p>Walking Time</p>
                  <ul className="list-disc list-outside">
                    <li>(0) Heels apart</li>
                    <li>(1) Heels almost touching while walking</li>
                  </ul>
                  <FormField
                    control={methods.control}
                    name={"walkingTime"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-col gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <p
                    className={cn(
                      "",
                      !methods.watch("walkingTime") && "hidden lg:block",
                    )}
                  >
                    {methods.watch("walkingTime")}
                  </p>
                </div>
                <p className="text-lg font-semibold text-center border-b">
                  () Total Score (Maximum =12)
                </p>
              </div>
              <p className="text-lg font-semibold text-center border-b py-5">
                Balance Assessment+Gait Assessment=
              </p>
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

export default Tinetti;
