"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import EndocrineImage from "@/assets/images/endocrine.jpg";
import FaceImage from "@/assets/images/face.jpg";
import RespiratoryImage from "@/assets/images/respiratory.jpg";
import SkinImage from "@/assets/images/skin.jpg";
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
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  observationDefaultValue,
  ObservationForm,
  observationSchema,
} from "@/schema/assessment/sn-visit/observation-one";
import { ObjectData } from "@/types";

import SNImage from "./sn-image";

const Observation1 = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: ObservationForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<ObservationForm>({
    resolver: zodResolver(observationSchema),
    defaultValues: observationDefaultValue,
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
            snVisit: parseData({ ...assessment, observation1: data }),
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
            <div className="flex justify-center lg:justify-between flex-wrap gap-5 items-center">
              <SNImage title="RESPIRATORY" image={RespiratoryImage} />
              <SNImage title="SKIN" image={SkinImage} />
              <SNImage title="ENDOCRINE" image={EndocrineImage} />
              <SNImage title="EAR / EYES / NOSE / THROAT" image={FaceImage} />
            </div>
            <div>
              <FormHeader className="mt-4">VITAL SIGNS</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"vitalSignsResp"}
                  render={({ field }) => (
                    <FormRender label="Resp:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsBloodPressure"}
                  render={({ field }) => (
                    <FormRender label="Blood Pressure:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsApicalPulse"}
                  render={({ field }) => (
                    <FormRender label="Apical Pulse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsLying"}
                  render={({ field }) => (
                    <FormRender label="Lying:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsRadialPulse"}
                  render={({ field }) => (
                    <FormRender label="Radial Pulse:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsStanding"}
                  render={({ field }) => (
                    <FormRender label="Standing:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsWeight"}
                  render={({ field }) => (
                    <FormRender label="Weight:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsSitting"}
                  render={({ field }) => (
                    <FormRender label="Sitting:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"vitalSignsTemp"}
                  render={({ field }) => (
                    <FormRender label="Temp:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">RESPIRATORY</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isRespiratoryClear"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Clear</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"clearOther"}
                  render={({ field }) => (
                    <FormRender label="Clear Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"respiratory"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "sputum", label: "Sputum" },
                          { value: "cough", label: "Cough" },
                          { value: "wheezing", label: "Wheezing" },
                          { value: "rales", label: "Rales" },
                          { value: "apnea", label: "Apnea" },
                          { value: "uneven", label: "Uneven" },
                          { value: "rhonci", label: "Rhonci" },
                          { value: "diminished", label: "Diminished" },
                          { value: "crepitation", label: "Crepitation" },
                          { value: "adventitious", label: "Adventitious" },
                          { value: "stridor", label: "Stridor" },
                          { value: "pluer", label: "Pluer" },
                        ]}
                        name={"respiratory"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"breathOther"}
                  render={({ field }) => (
                    <FormRender label="Breath Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">DYSPNEA</FormHeader>
              <div className="grid lg:grid-cols-2 items-center gap-5">
                <FormField
                  control={methods.control}
                  name={`dsypnea`}
                  render={({ field }) => (
                    <FormRender label={"Type of Wound"}>
                      <SelectInput
                        allowClear
                        options={[
                          {
                            value: "not-short-breath",
                            label: "Patient is not short of breath",
                          },
                          {
                            value: "climb-stairs",
                            label: "When walking more than 20ft, Climb stairs",
                          },
                          {
                            value: "maximum-exertion",
                            label: "On maximum exertion",
                          },
                          {
                            value: "minimum-exertion",
                            label: "On minimum exertion",
                          },
                          {
                            value: "moderate-exertion",
                            label: "On moderate exertion",
                          },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isDsypneaClear"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">Clear</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dsypneaO2"}
                  render={({ field }) => (
                    <FormRender label="O2">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div>
                  <p className="text-sm font-semibold pb-2">Via:</p>
                  <FormField
                    control={methods.control}
                    name={"dsypneaVia"}
                    render={() => (
                      <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "nc", label: "NC" },
                            { value: "mask", label: "Mask" },
                            { value: "prn", label: "PRN" },
                            { value: "continuous", label: "Continuous" },
                          ]}
                          name={"dsypneaVia"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"o2Stats"}
                  render={({ field }) => (
                    <FormRender label="O2 Stats:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"capRefill"}
                  render={({ field }) => (
                    <FormRender label="Cap Refill:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">ENDOCRINE</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isEndocrineNA"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">N/A</span>
                      </div>
                    </FormRender>
                  )}
                />

                <div className="grid lg:grid-cols-2 gap-5 items-end">
                  <FormField
                    control={methods.control}
                    name={"fsbsObtainedFrom"}
                    render={({ field }) => (
                      <FormRender label="FSBS Obtained From:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"fsbsResults"}
                    render={({ field }) => (
                      <FormRender label="Results:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"fsbsControl"}
                    render={({ field }) => (
                      <FormRender label="Control:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"testPerformedBy"}
                    render={({ field }) => (
                      <FormRender label="Test Performed By:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"ptObtainedFrom"}
                    render={({ field }) => (
                      <FormRender label="PT/INR Obtained From:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"endocrineFbs"}
                    render={() => (
                      <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "FBS", label: "FBS" },
                            { value: "RBS", label: "RBS" },
                            { value: "NFBS", label: "NFBS" },
                          ]}
                          name={"endocrineFbs"}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="grid gap-5 border border-dashed p-2">
                  <FormField
                    control={methods.control}
                    name={"isGlucometerControl"}
                    render={({ field }) => (
                      <FormRender formClassName="mt-4">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Glucometer Control:</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <div className="grid lg:grid-cols-2 gap-5 items-end">
                    <FormField
                      control={methods.control}
                      name={"insulineType"}
                      render={({ field }) => (
                        <FormRender label="Insulin Type:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"glucometerControlDose"}
                      render={({ field }) => (
                        <FormRender label="Dose:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"glucometerControlRoute"}
                    render={() => (
                      <FormRender
                        label="Route:"
                        formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "sq-on-site:", label: "SQ on Site:" },
                            { value: "ruq-abd", label: "RUQ Abd" },
                            { value: "luq-abd", label: "LUQ Abd" },
                            { value: "rlq-abd", label: "RLQ Abd" },
                            { value: "llq-abd", label: "LLQ Abd" },
                            { value: "right-arm", label: "Right Arm" },
                            { value: "left-arm", label: "Left Arm" },
                            { value: "right-thigh", label: "Right Thigh" },
                            { value: "left-thigh", label: "Left Thigh" },
                          ]}
                          name={"glucometerControlRoute"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid gap-5 border border-dashed p-2">
                  <FormField
                    control={methods.control}
                    name={"isSlidingScaleInsulin"}
                    render={({ field }) => (
                      <FormRender formClassName="mt-4">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Sliding Scale insulin:
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <div className="grid lg:grid-cols-2 gap-5 items-end">
                    <FormField
                      control={methods.control}
                      name={"administrationType"}
                      render={({ field }) => (
                        <FormRender label="Administration Type:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"slidingScaleDose"}
                      render={({ field }) => (
                        <FormRender label="Dose:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"slidingScaleRoute"}
                    render={() => (
                      <FormRender
                        label="Route:"
                        formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "sq-on-site:", label: "SQ on Site:" },
                            { value: "ruq-abd", label: "RUQ Abd" },
                            { value: "luq-abd", label: "LUQ Abd" },
                            { value: "rlq-abd", label: "RLQ Abd" },
                            { value: "llq-abd", label: "LLQ Abd" },
                            { value: "right-arm", label: "Right Arm" },
                            { value: "left-arm", label: "Left Arm" },
                            { value: "right-thigh", label: "Right Thigh" },
                            { value: "left-thigh", label: "Left Thigh" },
                          ]}
                          name={"slidingScaleRoute"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"footAssessment"}
                  render={() => (
                    <FormRender
                      label="Foot Assessment:"
                      formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "appropriate-footware",
                            label: "Appropriate Footwear",
                          },
                          {
                            value: "actuity-function",
                            label: "Vision Acuity Function",
                          },
                          {
                            value: "food-intake",
                            label: "Adequate Food Intake",
                          },
                          {
                            value: "peripheral-neuropathy",
                            label: "Peripheral Neuropathy",
                          },
                        ]}
                        name={"footAssessment"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">NEUROLOGICAL</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"isNeurological"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">A&0x3</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"orientedOther"}
                  render={() => (
                    <FormRender
                      label="Oriented Other:"
                      formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "time", label: "Time" },
                          { value: "place", label: "Place" },
                          { value: "person", label: "Person" },
                        ]}
                        name={"orientedOther"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"neurological"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "alert", label: "Alert" },
                          { value: "forgetful", label: "Forgetful" },
                          { value: "dizziness", label: "Dizziness" },
                          { value: "agitated", label: "Agitated" },
                          { value: "lethargic", label: "Lethargic" },
                          { value: "disoriented", label: "Disoriented" },
                          { value: "tremors", label: "Tremors" },
                          { value: "nueropathy", label: "Nueropathy" },
                          {
                            value: "impaired-speech",
                            label: "Impaired Speech",
                          },
                          { value: "other", label: "Other" },
                        ]}
                        name={"neurological"}
                      />
                    </FormRender>
                  )}
                />
                {methods.watch("neurological")?.includes("other") && (
                  <FormField
                    control={methods.control}
                    name={"otherNeurological"}
                    render={({ field }) => (
                      <FormRender label={"Other"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}

                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"grasps"}
                    render={({ field }) => (
                      <FormRender label="Grasps">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          options={[
                            { value: "RIGHT", label: "Right" },
                            { value: "LEFT", label: "Left" },
                            { value: "BOTH", label: "Both" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"othergrasps"}
                    render={({ field }) => (
                      <FormRender label={"Other Grasps"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"pupils"}
                    render={({ field }) => (
                      <FormRender label="Pupils">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          options={[
                            { value: "PERRLA", label: "PERRLA" },
                            { value: "EQUAL", label: "Equal" },
                            { value: "REACTIVE", label: "Reactive" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherPupils"}
                    render={({ field }) => (
                      <FormRender label={"Other Pupils"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                EAR / EYES / NOSE / THROAT
              </FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"face"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "WNL", label: "WNL" },
                          {
                            value: "impaired-vision",
                            label: "Impaired Vision",
                          },
                          { value: "glass", label: "Glass / Contacts" },
                          {
                            value: "impaired-speech",
                            label: "Impaired Speech",
                          },
                          { value: "cataract", label: "Cataract/Glaucoma" },
                          { value: "epistaxis", label: "Epistaxis" },
                          {
                            value: "impaired-hearing",
                            label: "Impaired Hearing",
                          },
                          { value: "congestion", label: "Congestion" },
                          { value: "tinnitus", label: "Tinnitus" },
                          { value: "blind", label: "Blind" },
                          { value: "deaf", label: "Deaf" },
                        ]}
                        name={"face"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"otherBlind"}
                    render={({ field }) => (
                      <FormRender label={"Blind Other:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherDeaf"}
                    render={({ field }) => (
                      <FormRender label={"Deaf Other:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">URINE</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"urine"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "no-difficulties",
                            label: "No Difficulties",
                          },
                          { value: "incontinent", label: "Incontinent" },
                          {
                            value: "bladder-program",
                            label: "Bladder Program",
                          },
                          { value: "retention", label: "Retention" },
                          { value: "urgency", label: "Urgency" },
                          { value: "anuria", label: "Anuria" },
                          { value: "oliguria", label: "Oliguria" },
                          { value: "nocturia", label: "Nocturia" },
                          { value: "hematuria", label: "Hematuria" },
                          { value: "polyuria", label: "Polyuria" },
                          { value: "dysuria", label: "Dysuria" },
                        ]}
                        name={"urine"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid lg:grid-cols-2 gap-5">
                  {methods.watch("urine")?.includes("polyuria") && (
                    <FormField
                      control={methods.control}
                      name={"polyuriaFrequency"}
                      render={({ field }) => (
                        <FormRender label={"Polyuria Frequency"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  )}
                  {methods.watch("urine")?.includes("dysuria") && (
                    <FormField
                      control={methods.control}
                      name={"dysuriaFrequency"}
                      render={({ field }) => (
                        <FormRender label={"Dysuria Frequency"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  )}
                </div>
                <FormField
                  control={methods.control}
                  name={"catheter"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "teaching-catheter",
                            label: "Teaching Catheter",
                          },
                          { value: "foley-catheter", label: "Foley Catheter" },
                          {
                            value: "straight-catheter",
                            label: "Straight Catheter",
                          },
                          {
                            value: "suprapubic-catheter",
                            label: "Suprapubic Catheter",
                          },
                          {
                            value: "foley-insertion",
                            label: "Foley Insertion",
                          },
                        ]}
                        name={"catheter"}
                      />
                    </FormRender>
                  )}
                />
                {methods.watch("catheter")?.includes("foley-insertion") && (
                  <FormField
                    control={methods.control}
                    name={`foleyInsertionDate`}
                    render={({ field }) => (
                      <FormRender label="Foley Insertion Date">
                        <DateInput {...field} value={field.value as Date} />
                      </FormRender>
                    )}
                  />
                )}
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"diapers"}
                    render={({ field }) => (
                      <FormRender label={"Diapers:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherUrine"}
                    render={({ field }) => (
                      <FormRender label={"Other:"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm font-semibold pb-2">Urine Output</p>
                    <FormField
                      control={methods.control}
                      name={"urineOutput"}
                      render={() => (
                        <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "adequate", label: "Adequate" },
                              { value: "clear", label: "Clear" },
                              { value: "odor", label: "Odor" },
                              { value: "inAdequate", label: "InAdequate" },
                              { value: "cloudy", label: "Cloudy" },
                              { value: "sediment", label: "Sediment" },
                            ]}
                            name={"urineOutput"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherUrineOutput"}
                    render={({ field }) => (
                      <FormRender label={"Output"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"dialysisShunt"}
                  render={() => (
                    <FormRender
                      label="Dialysis Shunt:"
                      formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "LUE", label: "LUE" },
                          { value: "RUE", label: "RUE" },
                          { value: "LLE", label: "LLE" },
                          { value: "RLE", label: "RLE" },
                        ]}
                        name={"dialysisShunt"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid lg:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"thrill"}
                    render={({ field }) => (
                      <FormRender label="Bruit/Thrill">
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          options={[
                            { value: "POSITIVE", label: "+ve" },
                            { value: "NEGATIVE", label: "-ve" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"infection"}
                    render={({ field }) => (
                      <FormRender label="S/S of Infection">
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
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">SKIN CONDITION</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"skinCondition"}
                  render={() => (
                    <FormRender formClassName="flex items-center lg:col-span-2 flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "warm", label: "Warm" },
                          { value: "cool", label: "Cool" },
                          { value: "cold", label: "Cold" },
                          {
                            value: "non-elastic",
                            label: "Tugor (Non Elastic)",
                          },
                          { value: "elastic", label: "Tugor (Elastic)" },
                          { value: "diaphoretic", label: "Diaphoretic" },
                          { value: "skin-broken", label: "Skin Broken" },
                          { value: "dry", label: "Dry" },
                          { value: "cyanotic", label: "Cyanotic" },
                          { value: "pale", label: "Pale" },
                          { value: "jaundice", label: "Jaundice" },
                          { value: "clammy", label: "Clammy" },
                          {
                            value: "shunt-assessment",
                            label: "Shunt Assessment",
                          },
                          { value: "bruit", label: "Bruit" },
                          { value: "thrill", label: "Thrill" },
                          {
                            value: "under-skin-rash",
                            label: "Under Skin Rash",
                          },
                        ]}
                        name={"skinCondition"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"edema"}
                  render={({ field }) => (
                    <FormRender label="Edema">
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
                  name={"otherSkinCondition"}
                  render={({ field }) => (
                    <FormRender label={"Other:"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">MUSCULOSKELETAL</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"musculoskeletal"}
                  render={() => (
                    <FormRender formClassName="flex items-center lg:col-span-2 flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "full-rom",
                            label: "Full ROM, Strength, Symmetry",
                          },
                          { value: "bedbound", label: "Bedbound" },
                          { value: "unsteady-bait", label: "Unsteady Gait" },
                          { value: "amputations", label: "Amputations" },
                          {
                            value: "joint-pain",
                            label: "Joint Pain/Stiffness",
                          },
                          { value: "contracture", label: "Contracture" },
                          { value: "paralysis", label: "Paralysis" },
                          { value: "arthritis", label: "Arthritis" },
                          {
                            value: "fall-precautions",
                            label: "Fall Precautions",
                          },
                          { value: "chair-bound", label: "Chair Bound" },
                          { value: "AKA", label: "AKA" },
                          { value: "BKA", label: "BKA" },
                          { value: "fracture", label: "Fracture" },
                          { value: "ambulatory-aid", label: "Ambulatory Aid" },
                          { value: "walker", label: "Walker" },
                          { value: "cane", label: "Cane" },
                          { value: "crutches", label: "Crutches" },
                          { value: "wheelchair", label: "W/Chair" },
                        ]}
                        name={"musculoskeletal"}
                      />
                    </FormRender>
                  )}
                />
                {methods.watch("musculoskeletal")?.includes("fracture") && (
                  <FormField
                    control={methods.control}
                    name={`fractureDetails`}
                    render={({ field }) => (
                      <FormRender label="Fracture Details:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                )}
                <FormField
                  control={methods.control}
                  name={`ambulatoryAidExplain`}
                  render={({ field }) => (
                    <FormRender label="Ambulatory Aid Explain:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PSYCHO SOCIAL</FormHeader>
              <div className="grid  gap-5">
                <FormField
                  control={methods.control}
                  name={"psychosocial"}
                  render={() => (
                    <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "WNL", label: "WNL" },
                          {
                            value: "poor-home-environmnet",
                            label: "Poor Home Environmnet",
                          },
                          {
                            value: "poor-coping-skills",
                            label: "Poor Coping Skills",
                          },
                          {
                            value: "impaired-decision-making",
                            label: "Impaired Decision making",
                          },
                          { value: "depressed-mood", label: "Depressed Mood" },
                          { value: "agitated", label: "Agitated" },
                          {
                            value: "expressed-anxiety",
                            label: "Expressed Anxiety",
                          },
                          {
                            value: "inappropriate-behavior",
                            label: "Inappropriate Behavior",
                          },
                          { value: "irritability", label: "Irritability" },
                        ]}
                        name={"psychosocial"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`psychosocialComments`}
                  render={({ field }) => (
                    <FormRender label="Comments:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
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
                      <FormRender formClassName=" lg:col-span-2">
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
                              label: "patient-declined",
                              value: "Patient Declined",
                            },
                            { label: "bedbound", value: "Bedbound" },
                            { label: "paralized", value: "Paralized" },
                            { label: "amputee", value: "Amputee" },
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

export default Observation1;
