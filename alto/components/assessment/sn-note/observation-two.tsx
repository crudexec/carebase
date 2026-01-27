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
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  observationTwoDefaultValue,
  ObservationTwoForm,
  observationTwoSchema,
} from "@/schema/assessment/sn-visit/observation-two";
import { ObjectData } from "@/types";

const Observation2 = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: ObservationTwoForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<ObservationTwoForm>({
    resolver: zodResolver(observationTwoSchema),
    defaultValues: observationTwoDefaultValue,
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
            snVisit: parseData({ ...assessment, observation2: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div>
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
              <FormHeader className="mt-4">FALLS RISK ASSESSMENT</FormHeader>
              <div className="grid gap-5">
                <div className="grid lg:grid-cols-2 border border-dashed p-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={`tugScore`}
                    render={({ field }) => (
                      <FormRender label="TUG score:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm font-semibold">seconds</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <div className="lg:col-span-2">
                    <p className="text-sm font-semibold pb-2">
                      Check All That Apply:
                    </p>
                    <FormField
                      control={methods.control}
                      name={"fallRisksAssessment"}
                      render={() => (
                        <FormRender formClassName="flex items-center  flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "slow-tentative-pace ",
                                label: "Slow tentative pace ",
                              },
                              {
                                value: "loss-of-balance",
                                label: "Loss of balance",
                              },
                              {
                                value: "short-strides",
                                label: "Short strides",
                              },
                              {
                                value: "no-arm-swing",
                                label: "Little or no arm swing",
                              },
                              {
                                value: "self-on-walls",
                                label: "Steadying self-on-walls",
                              },
                              { value: "shuffling", label: "Shuffling" },
                              {
                                value: "bloc-turning ",
                                label: "En bloc turning ",
                              },
                              {
                                value: "assistive-device",
                                label: "Not using assistive device properly",
                              },
                            ]}
                            name={"fallRisksAssessment"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 border border-dashed p-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isStandTest"}
                    render={({ field }) => (
                      <FormRender formClassName=" lg:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm font-semibold">
                            30 second chair stand test:
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`standTestNumber`}
                    render={({ field }) => (
                      <FormRender label="Number:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`standTestScore`}
                    render={({ field }) => (
                      <FormRender label="Score:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-2 border border-dashed p-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isBalancedTest"}
                    render={({ field }) => (
                      <FormRender formClassName="lg:col-span-2">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm font-semibold">
                            The-4-stage balance test:
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`standWithFeet`}
                    render={({ field }) => (
                      <FormRender label="1.Stand with feet side by side">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm font-semibold">seconds</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`placeInstep`}
                    render={({ field }) => (
                      <FormRender label="2.Place instep of one-foot touching big toe of the other foot:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm font-semibold">seconds</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`tandemStand`}
                    render={({ field }) => (
                      <FormRender label="3.Tandem stand(one foot in front of the other;heel touching the toe):">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm font-semibold">seconds</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`standOnOneFoot`}
                    render={({ field }) => (
                      <FormRender label="4.Stand on one foot:">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input {...field} value={field.value as string} />
                          </div>
                          <p className="text-sm font-semibold">seconds</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"chairRise"}
                    render={({ field }) => (
                      <FormRender label="Chair rise exercise">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
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
                    name={`notes`}
                    render={({ field }) => (
                      <FormRender label="Notes:">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-2 border border-dashed p-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"reasonNotDone"}
                    render={({ field }) => (
                      <FormRender label="Reason not done">
                        <SelectInput
                          allowClear
                          options={[
                            {
                              value: "patient-declined",
                              label: "Patient Declined",
                            },
                            { value: "bedbound", label: "Bedbound" },
                            { value: "paralized", label: "Paralized" },
                            { value: "Amputee", label: "Amputee" },
                          ]}
                          field={field}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`otherReason`}
                    render={({ field }) => (
                      <FormRender label="Other:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">CIRCULATORY</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"heart"}
                  render={() => (
                    <FormRender
                      label="Heart:"
                      formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "regular-rate",
                            label: "Regular Rate & Rhythm (RRR)",
                          },
                          { value: "heart-failure", label: "Heart Failure" },
                          {
                            value: "heart-irregular",
                            label: "Heart Irregular",
                          },
                          { value: "murmur", label: "Murmur" },
                          { value: "gallop", label: "Gallop" },
                          { value: "click", label: "Click" },
                          { value: "dizziness", label: "Dizziness" },
                          { value: "orthopnea", label: "Orthopnea" },
                          { value: "defibrillator", label: "Defibrillator" },
                          { value: "pacemaker", label: "Pacemaker" },
                        ]}
                        name={"heart"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"circulatoryEdema"}
                  render={() => (
                    <FormRender
                      label="Edema:"
                      formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "pitting", label: "Pitting" },
                          { value: "non-pitting", label: "Non-Pitting" },
                          { value: "+1", label: "+1" },
                          { value: "+2", label: "+2" },
                          { value: "+3", label: "+3" },
                          { value: "+4", label: "+4" },
                        ]}
                        name={"circulatoryEdema"}
                      />
                    </FormRender>
                  )}
                />

                <div className="grid lg:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm pb-2 font-semibold">Peripheral:</p>
                    <FormField
                      control={methods.control}
                      name={"circulatoryPeripheral"}
                      render={() => (
                        <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "LR", label: "LR" },
                              { value: "RR", label: "RR" },
                              { value: "LP", label: "LP" },
                              { value: "RP", label: "RP" },
                            ]}
                            name={"circulatoryPeripheral"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={`otherPeripheral`}
                    render={({ field }) => (
                      <FormRender label="Other Peripheral">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div>
                    <p className="text-sm pb-2 font-semibold">
                      Capillary refill:
                    </p>
                    <FormField
                      control={methods.control}
                      name={"capillaryRefill"}
                      render={() => (
                        <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "lesser-sec", label: "<3 Sec" },
                              { value: "greater-sec", label: ">3 Sec" },
                              { value: "chest-pain", label: "Chest Pain" },
                            ]}
                            name={"circulatoryPeripheral"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={`otherCapillaryRefill`}
                    render={({ field }) => (
                      <FormRender label="Other Capillary refill">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`pulses`}
                    render={({ field }) => (
                      <FormRender label="Pulses:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`otherCirculatory`}
                    render={({ field }) => (
                      <FormRender label="Other:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PAIN ASSESSMENT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`painRelief`}
                  render={({ field }) => (
                    <FormRender label={"Pain Relief:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "adequate", label: "Adequate" },
                          { value: "non-adequate", label: "Non Adequate" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`prescription`}
                  render={({ field }) => (
                    <FormRender label={"Prescription:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "RX", label: "RX" },
                          { value: "without-rx", label: "Without RX" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`location`}
                  render={({ field }) => (
                    <FormRender label="Location:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`duration`}
                  render={({ field }) => (
                    <FormRender label="Duration:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`medication`}
                  render={({ field }) => (
                    <FormRender label="Medication:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`frequency`}
                  render={({ field }) => (
                    <FormRender label={"Frequency:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "occational", label: "Occational" },
                          { value: "continuous", label: "Continuous" },
                          { value: "intermittent", label: "Intermittent" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`descriptionOfPain`}
                  render={({ field }) => (
                    <FormRender label="Description of Pain:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painManagementIntervention`}
                  render={({ field }) => (
                    <FormRender label="Pain Management Interventions:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painLevelBeforeMedication`}
                  render={({ field }) => (
                    <FormRender label={"Pain level before medication:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "0", label: "0" },
                          { value: "1", label: "1" },
                          { value: "2", label: "2" },
                          { value: "3", label: "3" },
                          { value: "4", label: "4" },
                          { value: "5", label: "5" },
                          { value: "6", label: "6" },
                          { value: "7", label: "7" },
                          { value: "8", label: "8" },
                          { value: "9", label: "9" },
                          { value: "10", label: "10" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`painLevelAfterMedication`}
                  render={({ field }) => (
                    <FormRender label={"Pain level after medication:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "0", label: "0" },
                          { value: "1", label: "1" },
                          { value: "2", label: "2" },
                          { value: "3", label: "3" },
                          { value: "4", label: "4" },
                          { value: "5", label: "5" },
                          { value: "6", label: "6" },
                          { value: "7", label: "7" },
                          { value: "8", label: "8" },
                          { value: "9", label: "9" },
                          { value: "10", label: "10" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`currentPainLevel`}
                  render={({ field }) => (
                    <FormRender label={"Current Pain Level:"}>
                      <SelectInput
                        allowClear
                        options={[
                          { value: "0", label: "0" },
                          { value: "1", label: "1" },
                          { value: "2", label: "2" },
                          { value: "3", label: "3" },
                          { value: "4", label: "4" },
                          { value: "5", label: "5" },
                          { value: "6", label: "6" },
                          { value: "7", label: "7" },
                          { value: "8", label: "8" },
                          { value: "9", label: "9" },
                          { value: "10", label: "10" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOMEBOUND STATUS</FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">
                  Describe the patient's functional status that renders him/her
                  homebound. Must meet Criteria One A or B and Criteria Two A &
                  B.
                </p>
                <FormField
                  control={methods.control}
                  name={"homeboundStatus"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "considered-taxing",
                            label: "Considered taxing effort to leave home",
                          },
                          {
                            value: "minimal-exertion",
                            label: "Dyspenea with minimal exertion",
                          },
                          {
                            value: "leave-home",
                            label:
                              "Cannot safely leave home without assist of 1-2 person(s)",
                          },
                          { value: "stretcher", label: "Stretcher" },
                          { value: "WC", label: "WC" },
                          { value: "bed-bound", label: "Bed Bound" },
                          { value: "chai-bound", label: "Chai Bound" },
                          {
                            value: "confusion",
                            label:
                              "Confusion, unsafe to go out of the home alone",
                          },
                          {
                            value: "frequent-vertigo",
                            label: "Frequent vertigo / syncope",
                          },
                          {
                            value: "decresed-endurance",
                            label: "Decresed Endurance",
                          },
                          {
                            value: "adaptive-device",
                            label: "Dependent upon adaptive device(s)",
                          },
                          {
                            value: "medical-restrictions",
                            label: "Medical Restrictions",
                          },
                          {
                            value: "psychiatric-problems",
                            label:
                              "Unable to leave home without assist due to psychiatric problems",
                          },
                          {
                            value: "needs-assistance",
                            label: "Needs assistance for all activities",
                          },
                        ]}
                        name={"homeboundStatus"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`oasisPopulateHomebound`}
                  render={({ field }) => (
                    <FormRender label="Choose an Oasis to populate homebound:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaOneA`}
                  render={({ field }) => (
                    <FormRender label="Criteria One: A. Requires the assistance of supportive device, use of special transportation, or the assistance of another person to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaOneB`}
                  render={({ field }) => (
                    <FormRender label="Or B. Leaving the home is medically contraindicated (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaTwoA`}
                  render={({ field }) => (
                    <FormRender label="AND Criteria Two: A. There exists a normal inability to leave home (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`criteriaTwoB`}
                  render={({ field }) => (
                    <FormRender label="AND B. Leaving home requires a considerable taxing effort (describe/explain):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`medicalCare`}
                  render={({ field }) => (
                    <FormRender label="AND Absences from the home are infrequent, or relatively short duration, or to receive medical care (describe):">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">HOSPITAL RISK ASSESSMENT</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={`hospitalRiskAssessment`}
                  render={({ field }) => (
                    <FormRender label="Hospital Risk Assessment:">
                      <Textarea {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">STANDARD PRECAUTIONS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"standardPrecaution"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "hand-washing", label: "Hand Washing" },
                          { value: "gloves-worn", label: "Gloves Worn" },
                          { value: "sharp-disposal", label: "Sharp Disposal" },
                          { value: "gown-worn", label: "Gown Worn" },
                          { value: "mask-worn", label: "Mask Worn" },
                        ]}
                        name={"standardPrecaution"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherStandardPrecaution`}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MEDICATION</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"medicationCompliance"}
                  render={({ field }) => (
                    <FormRender label="Medication Compliance:">
                      <SelectInput
                        options={[
                          { label: "Yes", value: "YES" },
                          { label: "No", value: "NO" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"medicationChange"}
                  render={({ field }) => (
                    <FormRender label="Medication Changed Since Last Visit:">
                      <SelectInput
                        options={[
                          { label: "Yes", value: "YES" },
                          { label: "No", value: "NO" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">Wound & Infusion</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"woundInfusion"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "wound",
                            label: "Wound Documentation Needed",
                          },
                          {
                            value: "infusion",
                            label: "Infusion Documentation Needed",
                          },
                        ]}
                        name={"woundInfusion"}
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

export default Observation2;
