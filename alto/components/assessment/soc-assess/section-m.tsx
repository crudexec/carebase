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
  sectionMDefaultValue,
  SectionMForm,
  sectionMSchema,
} from "@/schema/assessment/soc-assess/section-m";
import { ObjectData } from "@/types";

const SectionM = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionMForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionMForm>({
    resolver: zodResolver(sectionMSchema),
    defaultValues: sectionMDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionM: formData }),
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
            <FormHeader className="mt-4">SKIN CONDITION</FormHeader>
            <div className="grid gap-5">
              <FormField
                control={methods.control}
                name={"unhealedPressureUlcer"}
                render={({ field }) => (
                  <FormRender label="(M1306) Does this patient have at least one Unhealed Pressure Ulcer/Injury at Stage 2 or Higher or designated as Unstageable? (Excludes Stage 1 pressure injuries and all healed Stage 2 pressure ulcers/Injuries)">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "no", label: "No - (Go to M1322)" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <p className="text-sm font-semibold">
                (M1311) Current Number of Unhealed (non-epithelialized) Pressure
                Ulcers at Each Stage: (Enter "0" if none; excludes Stage 1
                pressure ulcers)
              </p>
              <div className="grid lg:grid-cols-2 gap-5 items-end">
                <div>
                  <p className="text-sm font-semibold pb-2">
                    A1. Stage 2: Partial thickness loss of dermis presenting as
                    a shallow open ulcer with red pink wound bed, without
                    slough. May also present as an intact or open/ruptured
                    blister. Number of Stage 2 pressure ulcers (If 0 - Go to
                    M1311 B1)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`stage2`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    B1. Stage 3: Full thickness tissue loss. Subcutaneous fat
                    may be visible but bone, tendon, or muscle is not exposed.
                    Slough may be present but does not obscure the depth of
                    tissue loss. May include undermining and tunneling. Number
                    of Stage 3 pressure ulcers (If 0 - Go to M1311 C1)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`stage3`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    C1. Stage 4: Full thickness tissue loss with exposed bone,
                    tendon, or muscle. Slough or eschar may be present on some
                    parts of the wound bed. Often includes undermining and
                    tunneling. Number of Stage 4 pressure ulcers (If 0 - Go to
                    M1311 D1)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`stage4`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    D1. Unstageable: Non-removable dressing: Known but not
                    stageable due to non-removable dressing/device. Number of
                    unstageable pressure ulcers due to non-removable
                    dressing/device (If 0 - Go to M1311 E1)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`nonremovableDressing`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    E1. Unstageable: Slough and/or eschar: Known but not
                    stageable due to coverage of wound bed by slough and/or
                    eschar. Number of unstageable pressure ulcers due to
                    coverage of wound bed by slough and/or eschar (If 0 - Go to
                    M1311 F1)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`slough`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    F1. Unstageable: Deep tissue injury: Suspected deep tissue
                    injury in evolution. Number of unstageable pressure ulcers
                    with suspected deep tissue injury in evolution (If 0 - Go to
                    M1322)
                  </p>
                  <FormField
                    control={methods.control}
                    name={`deepTissueInjury`}
                    render={({ field }) => (
                      <FormRender
                        label="Number Currently Present:"
                        className="!font-normal"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            !methods
                              .watch("unhealedPressureUlcer")
                              ?.includes("yes")
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={methods.control}
                name={"currentNumberOfStageOne"}
                render={({ field }) => (
                  <FormRender label="(M1322) Current Number of Stage 1 Pressure Injuries: Intact skin with non-blanchable redness of a localized area usually over a bony prominence. The area may be painful, firm, soft, warmer, or cooler as compared to adjacent tissue. Darkly pigmented skin may not have a visible blanching; in dark skin tones only it may appear with persistent blue or purple hues.">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "0", label: "0" },
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                        { value: "4", label: "4 or more" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"stageOfMostProblematicUnhealedPressure"}
                render={({ field }) => (
                  <FormRender label="(M1324) Stage of Most Problematic Unhealed Pressure Injury that is Stageable:(Excludes pressure ulcer that cannot be staged due to a non-removable dressing/device, coverage of wound bed by slough and/or eschar, or suspected deep tissue injury.)">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "1", label: "Stage 1" },
                        { value: "2", label: "Stage 2" },
                        { value: "3", label: "Stage 3" },
                        { value: "4", label: "Stage 4" },
                        {
                          value: "NA",
                          label:
                            "NA - No observable pressure ulcer or unhealed pressure ulcer",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"patientHaveStasisUlcer"}
                render={({ field }) => (
                  <FormRender label="M1330) Does this patient have a Stasis Ulcer? ">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "no", label: "No - (Go to M1340)" },
                        {
                          value: "both",
                          label:
                            "Yes, patient has BOTH observable & unobservable stasis ulcers",
                        },
                        {
                          value: "obeservable-stasis-ulcer",
                          label:
                            " Yes, patient has observable stasis ulcers ONLY",
                        },
                        {
                          value: "unobservable-stasis-ulcer",
                          label:
                            "Yes, patient has unobservable stasis ulcers ONLY (known but not observable due to non-removable dressing) - (Go to M1340)",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"currentNumberOfStasisUlcer"}
                render={({ field }) => (
                  <FormRender label="(M1332) Current Number of (Observable) Stasis Ulcer(s)">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                        { value: "4", label: "4 or more" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"statusOfMostProblematicStasisUlcer"}
                render={({ field }) => (
                  <FormRender label="(M1334) Status of Most Problematic (Observable) Stasis Ulcer:">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "fully-granulating",
                          label: "Fully granulating",
                        },
                        {
                          value: "early-granulating",
                          label: "Early/partial granulating",
                        },
                        { value: "not-healing", label: "Not healing" },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"patientHaveSurgicalWound"}
                render={({ field }) => (
                  <FormRender label="(M1340) Does this patient have a Surgical Wound?">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "no", label: "No - (Go to M1400)" },
                        {
                          value: "yes",
                          label:
                            "Yes, patient has at least one (observable) surgical wound",
                        },
                        {
                          value: "known-but-not-observable",
                          label:
                            " Surgical wound known but not observable due to non-removeable dressing/device(Go to M1400)",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"statusOfMostProblematicSurgicalWound"}
                render={({ field }) => (
                  <FormRender label="(M1342) Status of Most Problematic (Observable) Surgical Wound:">
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "newly-epithelialized",
                          label: "Newly epithelialized",
                        },
                        {
                          value: "fully-granulating",
                          label: "Fully granulating",
                        },
                        {
                          value: "early-granulating",
                          label: "Early/partial granulating",
                        },
                        { value: "not-healing", label: "Not healing" },
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

export default SectionM;
