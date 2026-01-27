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
import {
  historyDefaultValue,
  HistoryForm,
  historySchema,
} from "@/schema/assessment/ot-eval/history";
import { InformationForm } from "@/schema/assessment/st-eval/information";
import { ObjectData } from "@/types";

const History = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: InformationForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    defaultValues: historyDefaultValue,
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
            otEval: parseData({ ...assessment, history: data }),
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
              <FormHeader className="mt-4">HOME EVALUATION</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"isHomeEvaluationAlone"}
                  render={({ field }) => (
                    <FormRender formClassName="lg:col-span-2">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Alone</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"liveSpouse"}
                  render={({ field }) => (
                    <FormRender label="Lives w/ Spouse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherLiveSpouse"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"homeEvaluation"}
                  render={() => (
                    <FormRender formClassName="flex lg:col-span-2 flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "home", label: "Home" },
                          { value: "apartment", label: "Apartment" },
                          { value: "mobile-home", label: "Mobile Home" },
                          { value: "senior-complex", label: "Senior Complex" },
                          { value: "single-level", label: "Single Level" },
                          { value: "multi-level", label: "Multi Level" },
                          { value: "stairs", label: "Stairs" },
                          { value: "elevator", label: "Elevator" },
                          { value: "spacious", label: "Spacious" },
                        ]}
                        name={"homeEvaluation"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"homeEvaluationType"}
                  render={() => (
                    <FormRender formClassName="flex lg:col-span-2 flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "clean", label: "Clean" },
                          { value: "crowded", label: "Crowded" },
                          { value: "cluttered", label: "Cluttered" },
                          { value: "soiled", label: "Soiled" },
                        ]}
                        name={"homeEvaluationType"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">SAFETY MEASURES</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"safetyMeasures"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "clear-pathways", label: "Clear Pathways" },
                          {
                            value: "adequate-lighting",
                            label: "Adequate Lighting",
                          },
                          {
                            value: "emergency-management",
                            label: "Emergency Management",
                          },
                          { value: "side-rails", label: "Side Rails" },
                          {
                            value: "isolation-precautions",
                            label: "Isolation Precautions",
                          },
                          {
                            value: "supervision",
                            label: "24 Hour Supervision",
                          },
                          {
                            value: "other-precaution",
                            label: "Other Precautions/Restrictions",
                          },
                        ]}
                        name={"safetyMeasures"}
                      />
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">
                    Architectural Barriers Interfering w/ Mobility:
                  </p>
                  <FormField
                    control={methods.control}
                    name={"architecturalBarrier"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "steps", label: "Steps/Stairs" },
                            { value: "doorways", label: "Doorways" },
                          ]}
                          name={"architecturalBarrier"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold pb-2">
                    Sanitation Hazards:
                  </p>
                  <FormField
                    control={methods.control}
                    name={"sanitationHazard"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "no-running-water ",
                              label: "No running water/plumbing ",
                            },
                            {
                              value: "insect-infestation",
                              label: "Insect/Rodent Infestation",
                            },
                            { value: "pets", label: "Pets" },
                            {
                              value: "cluttered-soiled-living-area",
                              label: "Cluttered soiled living area",
                            },
                            {
                              value: "inadequate-lighting",
                              label: "Inadequate lighting/heating/cooling",
                            },
                          ]}
                          name={"sanitationHazard"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">DME Available</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"dmeAvailable"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "wheelchair", label: "Wheelchair" },
                          { value: "walker", label: "Walker" },
                          { value: "hospital-bed", label: "Hospital Bed" },
                          {
                            value: "bedside-commode",
                            label: "Bedside Commode",
                          },
                          {
                            value: "raised-toilet-seat",
                            label: "Raised toilet seat",
                          },
                          { value: "tub-bench", label: "Tub/Shower bench" },
                          { value: "splints", label: "Splints" },
                          { value: "cane", label: "Cane" },
                          { value: "reacher", label: "Reacher" },
                          { value: "sock-donner", label: "Sock Donner" },
                          { value: "dressing-stick", label: "Dressing Stick" },
                          { value: "shower-chair", label: "Shower Chair" },
                          {
                            value: "long-handed-sponge",
                            label: "Long Handed Sponge",
                          },
                        ]}
                        name={"dmeAvailable"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">TREATMENT THIS VISIT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatmentThisVisit"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "evaluation", label: "Evaluation" },
                          {
                            value: "established-upgrade-home",
                            label: "Established Upgrade Home Prog",
                          },
                          {
                            value: "neuro-development-treatment",
                            label: "Neuro Development Treatment",
                          },
                          {
                            value: "transfer-training",
                            label: "Transfer Training",
                          },
                          {
                            value: "fine-motor-training",
                            label: "Fine Motor Training",
                          },
                          { value: "orthotics", label: "Orthotics/Splinting" },
                          { value: "adl-Training", label: "ADL Training" },
                          {
                            value: "sensory-treatment",
                            label: "Sensory Treatment",
                          },
                          {
                            value: "adaptive-equipment",
                            label: "Adaptive Equipment",
                          },
                          {
                            value: "muscle-re-education",
                            label: "Muscle Re-Education",
                          },
                          {
                            value: "perceptual-motor-training",
                            label: "Perceptual Motor Training",
                          },
                        ]}
                        name={"treatmentThisVisit"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherTreatmentThisVisit"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                TREATMENT PLAN/PLAN OF CARE ORDERS
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"treatmentPlan"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "evaluation", label: "Evaluation" },
                          {
                            value: "established-upgrade-home",
                            label: "Established Upgrade Home Prog",
                          },
                          {
                            value: "neuro-development-treatment",
                            label: "Neuro Development Treatment",
                          },
                          {
                            value: "transfer-training",
                            label: "Transfer Training",
                          },
                          {
                            value: "fine-motor-training",
                            label: "Fine Motor Training",
                          },
                          { value: "orthotics", label: "Orthotics/Splinting" },
                          { value: "adl-Training", label: "ADL Training" },
                          {
                            value: "sensory-treatment",
                            label: "Sensory Treatment",
                          },
                          {
                            value: "adaptive-equipment",
                            label: "Adaptive Equipment",
                          },
                          {
                            value: "muscle-re-education",
                            label: "Muscle Re-Education",
                          },
                          {
                            value: "perceptual-motor-training",
                            label: "Perceptual Motor Training",
                          },
                        ]}
                        name={"treatmentPlan"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherTreatmentPlan"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
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

export default History;
