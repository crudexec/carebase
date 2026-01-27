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
import { parseData } from "@/lib";
import { PhysicalForm } from "@/schema/assessment/pt-eval/physical";
import { ObjectData } from "@/types";

const Physical = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: PhysicalForm;
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
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            ptEval: parseData({ ...assessment, physical: data }),
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
                </Button>{" "}
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
                      <p>{item.value}:</p>
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
                  <p className="text-sm uppercase font-semibold">Hip</p>
                  {[
                    { key: "Flexion", value: "hipFlexion" },
                    { key: "Extension", value: "hipExtension" },
                    { key: "Abduction", value: "hipAbduction" },
                    { key: "Internal Rotation", value: "hipInternalRotation" },
                    { key: "External Rotation", value: "hipExternalRotation" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-5 gap-5 items-center"
                      key={index}
                    >
                      <p>{item?.value}:</p>
                      <FormField
                        control={methods.control}
                        name={`{item.value}StrengthL`}
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
                        name={`{item.value}StrengthR`}
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
                        name={`{item.value}RangeOfMotionL`}
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
                        name={`{item.value}RangeOfMotionR`}
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
                  <p className="text-sm uppercase font-semibold">Knee</p>
                  {[
                    { key: "Flexion", value: "kneeFlexion" },
                    { key: "Extension", value: "kneeExtension" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-5 gap-5 items-center"
                      key={index}
                    >
                      <p>{item.value}:</p>
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
                  <p className="text-sm uppercase font-semibold">Ankle</p>
                  {[
                    { key: "Dorsi", value: "ankleDorsi" },
                    { key: "Plantar", value: "anklePlantar" },
                    { key: "Inversion", value: "ankleInversion" },
                    { key: "Eversion", value: "ankleEversion" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-5 gap-5 items-center"
                      key={index}
                    >
                      <p>Flexion:</p>
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
                  <p className="text-sm uppercase font-semibold">Trunk</p>
                  {[
                    { key: "Flexion", value: "trunkFlexion" },
                    { key: "Extension", value: "trunkExtension" },
                    { key: "Rotation", value: "trunkRotation" },
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
                <div className="grid gap-5 text-sm font-normal">
                  <p className="text-sm uppercase font-semibold">Rolls</p>
                  {[
                    { key: "Rolls to L in Bed", value: "rollstoLInBed" },
                    { key: "Rolls to R in Bed", value: "rollsToRInBed" },
                  ].map((item, index) => (
                    <div
                      className="grid lg:grid-cols-5 gap-5 items-center"
                      key={index}
                    >
                      <p>{item?.key}:</p>
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
                  { key: "Assumes Sitting", value: "assumeSitting" },
                  { key: "Transfer to Bed", value: "transferToBed" },
                  { key: "Xfer Tub/Shower", value: "xferTubShower" },
                  { key: "Transfer Toilet", value: "transferToilet" },
                  { key: "Sit to Stand", value: "sitToStand" },
                  { key: "Stand to Sit", value: "standToSit" },
                  { key: "Gait/Device Type", value: "gaitDeviceType" },
                  { key: "Stairs/Steps/Curbs", value: "stairsStepsCurbs" },
                  { key: "Balance", value: "balance" },
                  { key: "Standing", value: "standing" },
                  { key: "Static 1", value: "staticOne" },
                  { key: "Dynamic 1", value: "dynamicOne" },
                  { key: "Sitting", value: "sitting" },
                  { key: "Static 2", value: "staticTwo" },
                  { key: "Dynamic 2", value: "dynamicTwo" },
                  { key: "Weight Bearing", value: "weightBearing" },
                  { key: "Personal Hygiene", value: "personalHygiene" },
                  { key: "Bathing", value: "bathing" },
                  { key: "Tub/Shower", value: "tubShower" },
                  { key: "Bed", value: "bed" },
                  { key: "Toileting", value: "toileting" },
                  { key: "Dress Upper Body", value: "dressUpperBody" },
                  { key: "Dress Lower Body", value: "dressLowerBody" },
                  { key: "Manages Braces", value: "managesBraces" },
                  { key: "Manages Footwear", value: "managesFootwear" },
                ].map((item, index) => (
                  <div
                    className="grid lg:grid-cols-6 items-center gap-5 text-sm font-semibold p-3"
                    key={index}
                  >
                    <p>{item?.key}:</p>
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
              <FormField
                control={methods.control}
                name={`comments`}
                render={({ field }) => (
                  <FormRender label="Comments">
                    <Textarea
                      {...field}
                      value={(field.value as string) ?? ""}
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

export default Physical;
