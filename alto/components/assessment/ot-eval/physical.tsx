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
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData, validateVisitDate } from "@/lib";
import { PhysicalForm } from "@/schema/assessment/pt-eval/physical";
import { ObjectData } from "@/types";

const Physical = ({
  assessmentId,
  patientScheduleId,
  mutate,
  assessment,
  data,
  timeIn,
  timeOut,
  visitDate,
  isQA,
}: {
  assessmentId?: string;
  data?: PhysicalForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  visitDate: Date;
  timeIn: string;
  timeOut: string;
  isQA: boolean;
}) => {
  const methods = useForm({
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
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
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
            otEval: parseData({ ...assessment, physical: data }),
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
              <FormHeader className="mt-4">ASSESSMENT</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-5 items-center gap-5 text-sm font-semibold bg-secondary p-3">
                  <p>* Indicates Synergistic Pattern</p>
                  <p>Strength L</p>
                  <p>Strength R</p>
                  <p>Range of Motion L</p>
                  <p>Range of Motion R</p>
                </div>

                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Shoulder</p>
                  {[
                    { key: "Flexion", value: "shoulderFlexion" },
                    { key: "Extension", value: "shoulderExtension" },
                    { key: "Abduction", value: "shoulderAbduction" },
                    {
                      key: "Internal Rotation",
                      value: "shoulderInternalRotation",
                    },
                    {
                      key: "External Rotation",
                      value: "shoulderExternalRotation",
                    },
                  ].map((item) => (
                    <div
                      key={item.value}
                      className="grid lg:grid-cols-5 gap-5 items-center"
                    >
                      <p>{item.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of R"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range Motion of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range of Motion R"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Elbow</p>
                  {[
                    { key: "Flexion", value: "elbowFlexion" },
                    { key: "Extension", value: "elbowExtension" },
                    { key: "Supination / Pronation", value: "elbowSupination" },
                  ].map((item) => (
                    <div
                      key={item.value}
                      className="grid lg:grid-cols-5 gap-5 items-center"
                    >
                      <p>{item.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of R"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range Motion of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range of Motion R"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Wrist</p>
                  {[
                    { key: "Flexion", value: "wristFlexion" },
                    { key: "Extension", value: "wristExtension" },
                  ].map((item) => (
                    <div
                      key={item.value}
                      className="grid lg:grid-cols-5 gap-5 items-center"
                    >
                      <p>{item.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of R"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range Motion of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range of Motion R"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Finger</p>
                  {[
                    { key: "Flexion", value: "fingerFlexion" },
                    { key: "Extension", value: "fingerExtension" },
                  ].map((item) => (
                    <div
                      key={item.value}
                      className="grid lg:grid-cols-5 gap-5 items-center"
                    >
                      <p>{item.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of R"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range Motion of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range of Motion R"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Thumb</p>
                  {[
                    { key: "Flexion", value: "thumbFlexion" },
                    { key: "Extension", value: "thumbExtension" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-5 gap-5 items-center"
                      key={index}
                    >
                      <p>{item.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}StrengthR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Strength of R"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionL`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range Motion of L"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.value}RangeOfMotionR`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Range of Motion R"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <FormHeader className="mt-4">FUNCTIONAL STATUS</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-6 items-center gap-5 text-sm font-semibold bg-secondary p-3">
                  <p></p>
                  <p>Independ</p>
                  <p>Supervise</p>
                  <p>Min Assist</p>
                  <p>Mod Assist</p>
                  <p>Depend</p>
                </div>
              </div>
              <div className="grid">
                {[
                  { key: "Dress Upper Ext", value: "dressUpperExt" },
                  { key: "Dress Lower Ext", value: "dressLowerExt" },
                  { key: "Feeding", value: "feeding" },
                  { key: "Utensil", value: "utensil" },
                  { key: "Hair", value: "hair" },
                  { key: "Teeth", value: "teeth" },
                  { key: "Shaving", value: "shaving" },
                  { key: "Nails", value: "nails" },
                  { key: "Toilet", value: "toilet" },
                  { key: "Bed", value: "bed" },
                  { key: "Tub/Shower", value: "tub" },
                  { key: "Kitchen", value: "kitchen" },
                  { key: "Meal Prep", value: "mealPrep" },
                ].map((item, index) => (
                  <div
                    className="grid lg:grid-cols-6 items-center gap-5 text-sm font-normal p-3"
                    key={index}
                  >
                    <p className="font-semibold">{item?.key}:</p>
                    <FormField
                      control={methods.control}
                      name={`${item?.value}Independ`}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Independ"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`${item?.value}Supervise`}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Supervise"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`${item?.value}MinAssist`}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Min Assist"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`${item?.value}ModAssist`}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Mod Assist"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`${item?.value}Depend`}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            placeholder="Depend"
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">
              ADDITIONAL ADL FUNCTIONAL ABILITY
            </FormHeader>
            <div>
              <div>
                <FormHeader className="mt-4 text-sm">Sensation</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  {[
                    { key: "Proprioception", value: "proprioception" },
                    { key: "Light Touch", value: "lightTouch" },
                    { key: "Deep Touch", value: "deepTouch" },
                    { key: "Sharp/Dull", value: "sharpDull" },
                    { key: "Hot/Cold", value: "hotCold" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-3 items-center gap-5 text-sm font-normal p-3"
                      key={index}
                    >
                      <p className="font-semibold">{item?.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Wnl`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="WNL"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Impaired`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Impaired"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <FormHeader className="mt-4 text-sm">
                  Perceptual Motor
                </FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  {[
                    { key: "Vision", value: "vision" },
                    { key: "Position in Space", value: "positionInSpace" },
                    { key: "L/R Discrimination", value: "lrDiscrimination" },
                    { key: "Depth Perception", value: "depthPerception" },
                    { key: "Awareness", value: "awareness" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-3 items-center gap-5 text-sm font-normal p-3"
                      key={index}
                    >
                      <p className="font-semibold">{item?.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Wnl`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="WNL"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Impaired`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Impaired"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <FormHeader className="mt-4 text-sm">Cognition</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  {[
                    { key: "Orientation", value: "orientation" },
                    { key: "Safety/Judgement", value: "safetyJudgement" },
                    { key: "Attention Span", value: "attentionSpan" },
                    { key: "Memory Retention", value: "memoryRetention" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-3 items-center gap-5 text-sm font-normal p-3"
                      key={index}
                    >
                      <p className="font-semibold">{item?.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Wnl`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="WNL"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Impaired`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Impaired"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <FormHeader className="mt-4 text-sm">Coordination</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  {[
                    { key: "Gross Motor", value: "grossMotor" },
                    { key: "Fine Motor", value: "fineMotor" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-3 items-center gap-5 text-sm font-normal p-3"
                      key={index}
                    >
                      <p className="font-semibold">{item?.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Wnl`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="WNL"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Impaired`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Impaired"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <FormHeader className="mt-4 text-sm">Balance</FormHeader>
                <div className="grid lg:grid-cols-2 gap-5">
                  {[
                    { key: "Static", value: "static" },
                    { key: "Dynamic", value: "dynamic" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-3 items-center gap-5 text-sm font-normal p-3"
                      key={index}
                    >
                      <p className="font-semibold">{item?.key}:</p>
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Wnl`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="WNL"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item?.value}Impaired`}
                        render={({ field }) => (
                          <FormRender>
                            <Input
                              {...field}
                              value={(field.value as string) ?? ""}
                              placeholder="Impaired"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  ))}
                </div>
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

export default Physical;
