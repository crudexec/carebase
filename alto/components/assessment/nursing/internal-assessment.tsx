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
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  internalAssessmentDefaultValues,
  InternalAssessmentForm,
  internalAssessmentSchema,
} from "@/schema/assessment/nursing/internal-assessment";
import { ObjectData } from "@/types";

const InternalAssessment = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: InternalAssessmentForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<InternalAssessmentForm>({
    resolver: zodResolver(internalAssessmentSchema),
    defaultValues: internalAssessmentDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [action, setAction] = useState<QAStatus>();
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
      setAction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const getTotalScore = () => {
    return (
      (methods.watch("hasAnIllness") ? 2 : 0) +
      (methods.watch("eatsFewerThan2Meals") ? 3 : 0) +
      (methods.watch("eatsFewFruits") ? 2 : 0) +
      (methods.watch("has3OrMoreDrinks") ? 2 : 0) +
      (methods.watch("hasToothOrMouthProblems") ? 2 : 0) +
      (methods.watch("doesNotHaveMoney") ? 4 : 0) +
      (methods.watch("eatsAlone") ? 1 : 0) +
      (methods.watch("takes3OrMoreDrugs") ? 1 : 0) +
      (methods.watch("hasLostOrGained") ? 2 : 0) +
      (methods.watch("notAbleToShop") ? 2 : 0)
    );
  };

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
            nursingAssessment: parseData({
              ...assessment,
              internalAssessment: data,
            }),
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
              <FormHeader className="mt-4">CARDIOPULMONARY</FormHeader>
              <div>
                <p className="text-sm pb-5 font-semibold">
                  This section completed in accordance with organizational
                  policy(circle all applicable items)
                </p>
                <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"cardiopulmonaryHeight"}
                    render={({ field }) => (
                      <FormRender label="Height:">
                        <Input
                          {...field}
                          value={field.value as string}
                          placeholder="6’4”"
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"cardiopulmonaryWeight"}
                    render={({ field }) => (
                      <FormRender label="Weight:">
                        <Input
                          {...field}
                          value={field.value as string}
                          placeholder="165 lbs"
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm py-5 font-semibold">Blood Pressure:</p>
                <div className="grid gap-5">
                  <div className="grid md:grid-cols-3 items-center gap-5">
                    <FormField
                      control={methods.control}
                      name={"isBloodPressureLying"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Sitting/lying:</span>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"bloodPressureLyingRight"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm">R</p>
                            <div className="flex-1">
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="6’4”"
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"bloodPressureLyingLeft"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm">L</p>
                            <div className="flex-1">
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="6’4”"
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 items-center gap-5">
                    <FormField
                      control={methods.control}
                      name={"isBloodPressureStanding"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Standing:</span>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"bloodPressureStandingRight"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm">R</p>
                            <div className="flex-1">
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="6’4”"
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"bloodPressureStandingLeft"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm">L</p>
                            <div className="flex-1">
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="6’4”"
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"cardiopulmonaryTemperature"}
                      render={({ field }) => (
                        <FormRender label={"Temperature"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"cardiopulmonaryTemperatureType"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              {...field}
                              options={[
                                { value: "ORAL", label: "Oral" },
                                { value: "AUXILLARY", label: "Axillary" },
                                { value: "RECTAL", label: "Rectal" },
                                { value: "TYMPANIC", label: "Tympanic" },
                                {
                                  value: "FOREHEAD",
                                  label: "Forehead (Non Contact)",
                                },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"cardiopulmonaryPulse"}
                      render={({ field }) => (
                        <FormRender label={"Pulse"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"cardiopulmonaryPulseType"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              {...field}
                              options={[
                                { value: "RADIAL", label: "Radial" },
                                { value: "APICAL", label: "Apical" },
                                { value: "BRACHIAL", label: "Brachial" },
                                { value: "AMBULATION", label: "Ambulation" },
                                {
                                  value: "REGULAR",
                                  label: "Regular/Irregular",
                                },
                                { value: "CAROTID", label: "Carotid" },
                                { value: "REST", label: "Rest" },
                                { value: "ACTIVITY", label: "Activity" },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={methods.control}
                    name={"heightSound"}
                    render={({ field }) => (
                      <FormRender label="Heart Sound">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            {
                              value: "REGULAR-IRREGULAR",
                              label: "Regular/Irregular",
                            },
                            { value: "MURMUR", label: "Murmur" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-3 gap-5">
                    <FormField
                      control={methods.control}
                      name={"isHeightSoundPacemaker"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Pacemaker:</span>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"heightSoundPacemakerDate"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm font-semibold">Date</p>
                            <div className="flex-1">
                              <DateInput
                                {...field}
                                value={field.value as Date}
                                onChange={(value) => {
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name={"heightSoundPacemakerType"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-5 items-center">
                            <p className="text-sm font-semibold">Type</p>
                            <div className="flex-1">
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="6’4”"
                              />
                            </div>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"respiration"}
                      render={({ field }) => (
                        <FormRender label={"Respirations"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"respirationType"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              {...field}
                              options={[
                                {
                                  value: "REGULAR-IRREGULAR",
                                  label: "Regular/Irregular",
                                },
                                {
                                  value: "CHEYNES-STOKES",
                                  label: "Cheynes Stokes",
                                },
                                {
                                  value: "DEATH-RATTLE",
                                  label: "Death rattle",
                                },
                                {
                                  value: "APNEA-PERIODS",
                                  label: "Apnea periods",
                                },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={methods.control}
                    name={"breathSounds"}
                    render={({ field }) => (
                      <FormRender label="Breath sounds:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "CLEAR", label: "Clear" },
                            { value: "CRACKLES", label: "Crackles/Rales" },
                            { value: "WHEEZES", label: "Wheezes/Rhonchi" },
                            { value: "DIMINISHED", label: "Diminished" },
                            { value: "ABSENT", label: "Absent" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"isBreathSoundAnterior"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Anterior:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"breathSoundsAnterior"}
                        render={() => (
                          <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                            <CheckboxGroup
                              methods={methods}
                              options={[
                                { value: "RIGHT", label: "Right" },
                                { value: "LEFT", label: "Left" },
                                { value: "UPPER", label: "Upper" },
                                { value: "LOWER", label: "Lower" },
                              ]}
                              name={"breathSoundsAnterior"}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"isBreathSoundPosterior"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Posterior:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"breathSoundsPosterior"}
                        render={() => (
                          <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                            <CheckboxGroup
                              methods={methods}
                              options={[
                                { value: "RIGHT", label: "Right" },
                                { value: "LEFT", label: "Left" },
                                { value: "UPPER", label: "Upper" },
                                { value: "LOWER", label: "Lower" },
                              ]}
                              name={"breathSoundsPosterior"}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={methods.control}
                    name={"breathSoundAccessaryMuscle"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "ACCESSORY-MUSCLE",
                              label: "Accessory Muscles used",
                            },
                            { value: "O2", label: "O2" },
                          ]}
                          name={"breathSoundAccessaryMuscle"}
                        />
                      </FormRender>
                    )}
                  />

                  <div className="grid grid-col-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={methods.control}
                      name={"breathSoundO2"}
                      render={({ field }) => (
                        <FormRender label={"O2 @"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundLpm"}
                      render={({ field }) => (
                        <FormRender label={"LPM per"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundSaturation"}
                      render={({ field }) => (
                        <FormRender label={"O2 Saturation"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>

                  <FormField
                    control={methods.control}
                    name={"otherBreathSound"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={"patientTrach"}
                      render={({ field }) => {
                        return (
                          <FormRender label="Does this patient have a trach?">
                            <RadioInput
                              className="flex-row flex-wrap gap-5 lg:items-center"
                              {...field}
                              value={field.value as string}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                              options={[
                                { value: "yes", label: "Yes" },
                                { value: "no", label: "No" },
                              ]}
                            />
                          </FormRender>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name={"whoManages"}
                      render={({ field }) => {
                        return (
                          <FormRender label="Who manages?">
                            <RadioInput
                              className="flex-row flex-wrap gap-5 lg:items-center"
                              {...field}
                              value={field.value as string}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                              options={[
                                { value: "self", label: "Self" },
                                { value: "rn", label: "RN" },
                                {
                                  value: "caregiver",
                                  label: "Caregiver/family",
                                },
                              ]}
                            />
                          </FormRender>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundCough"}
                      render={({ field }) => {
                        return (
                          <FormRender label="Cough">
                            <RadioInput
                              className="flex-row flex-wrap gap-5 lg:items-center"
                              {...field}
                              value={field.value as string}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                              options={[
                                { value: "dry", label: "Dry" },
                                { value: "acute", label: "Acute" },
                                { value: "chronic", label: "Chronic" },
                              ]}
                            />
                          </FormRender>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundProductive"}
                      render={({ field }) => {
                        return (
                          <FormRender label="Productive:">
                            <RadioInput
                              className="flex-row flex-wrap gap-5 lg:items-center"
                              {...field}
                              value={field.value as string}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                              options={[
                                { value: "thick", label: "Thick" },
                                { value: "thin", label: "Thin" },
                              ]}
                            />
                          </FormRender>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundColor"}
                      render={({ field }) => (
                        <FormRender label={"Color:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"breathSoundAmount"}
                      render={({ field }) => (
                        <FormRender label={"Amount:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"isUnableToCough"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Unable to cough up secretions
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"dyspneaActivity"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              {...field}
                              options={[
                                { value: "DYSPNEA", label: "Dyspnea" },
                                { value: "REST", label: "Rest" },
                                { value: "EXERTION", label: "Exertion" },
                                {
                                  value: "REGULAR-IRREGULAR",
                                  label: "Regular/Irregular",
                                },
                                { value: "CAROTID", label: "Carotid" },
                                { value: "REST", label: "Rest" },
                                { value: "ACTIVITY", label: "Activity" },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                    <FormField
                      control={methods.control}
                      name={"dyspneaActivityFeet"}
                      render={({ field }) => (
                        <FormRender label={"feet"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"duringAdl"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "DURING-ADL", label: "During ADL's" },
                            { value: "ORTHOPNEA", label: "Orthopnea" },
                          ]}
                          name={"duringAdl"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isDuringAdl"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"chestPain"}
                    render={() => (
                      <FormRender
                        label="Chest Pain:"
                        formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "ANGINAL", label: "Anginal" },
                            { value: "POSTURAL", label: "Postural" },
                            { value: "LOCALIZED", label: "Localized" },
                            { value: "SUBSTERNAL", label: "Substernal" },
                            { value: "RADIATING", label: "Radiating" },
                            { value: "DULL", label: "Dull" },
                            { value: "ACHE", label: "Ache" },
                            { value: "SHARP", label: "Sharp" },
                            { value: "VISE-LIKE", label: "Vise-like" },
                          ]}
                          name={"chestPain"}
                        />
                      </FormRender>
                    )}
                  />

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"associatedWith"}
                        render={() => (
                          <FormRender
                            label="Associated with:"
                            formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                          >
                            <CheckboxGroup
                              methods={methods}
                              options={[
                                {
                                  value: "SHORTNESS-OF-BREATH",
                                  label: "Shortness of breath",
                                },
                                { value: "ACTIVITY", label: "Activity" },
                                { value: "LOCALIZED", label: "Localized" },
                                { value: "SWEATS", label: "Sweats" },
                              ]}
                              name={"associatedWith"}
                            />
                          </FormRender>
                        )}
                      />
                    </div>

                    <FormField
                      control={methods.control}
                      name={"associatedWithFrequency"}
                      render={({ field }) => (
                        <FormRender label={"Frequency/duration:"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"chestPainPalpitation"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "PALPITATION", label: "Palpitation" },
                            { value: "FATIGUE", label: "Fatigue" },
                          ]}
                          name={"chestPainPalpitation"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"edemaPedal"}
                        render={() => (
                          <FormRender
                            label="Edema: Pedal:"
                            formClassName="flex flex-wrap items-center gap-5 !space-y-0"
                          >
                            <CheckboxGroup
                              methods={methods}
                              options={[
                                { value: "PEDAL", label: "Pedal" },
                                { value: "RIGHT", label: "Right" },
                                { value: "LEFT", label: "Left" },
                                { value: "SACRAL", label: "Sacral" },
                                { value: "DEPENDENT", label: "Dependent" },
                              ]}
                              name={"edemaPedal"}
                            />
                          </FormRender>
                        )}
                      />
                    </div>

                    <FormField
                      control={methods.control}
                      name={"edemaPedalDetail"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"isPitting"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Pitting</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"PittingNumber"}
                      render={({ field }) => (
                        <FormRender>
                          <RadioInput
                            className="flex-row gap-3 items-start"
                            {...field}
                            options={[
                              { value: "+1", label: "+1" },
                              { value: "+2", label: "+2" },
                              { value: "+3", label: "+3" },
                              { value: "+4", label: "+4" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isNonPitting"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Non-Pitting</span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"site"}
                    render={({ field }) => (
                      <FormRender label="Site:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"siteCramps"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "CRAMPS", label: "Cramps" },
                            { value: "CLAUDICATION", label: "Claudication" },
                            {
                              value: "CAPILLARY-REFILL-LESS",
                              label: "Capillary refill less than 3 sec",
                            },
                            {
                              value: "CAPILLARY-REFILL-GREATER",
                              label: "Capillary refill greater than 3 sec",
                            },
                          ]}
                          name={"siteCramps"}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherSite"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isNoCardiopulmonaryProblem"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">No Problem</span>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <FormHeader className="mt-4">ELIMINATION</FormHeader>
              <div className="grid grid-col-1 gap-5">
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"elimination"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "FLATULENCE", label: "Flatulence" },
                              {
                                value: "CONSTIPATION-IMPACTION",
                                label: "Constipation/impaction",
                              },
                              { value: "DIARRHEA", label: "Diarrhea" },
                              {
                                value: "RECTAL-BLEEDING ",
                                label: "rectal bleeding ",
                              },
                              { value: "HEMORRHOIDS", label: "Hemorrhoids" },
                              { value: "LAST-BM", label: "Last BM" },
                            ]}
                            name={"elimination"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <FormField
                    control={methods.control}
                    name={"eliminationDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isFrequencyOfStools"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Frequency of stools</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"frequencyOfStoolsDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          {...field}
                          value={field.value as string}
                          placeholder="Varies"
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"bowelRegime"}
                  render={({ field }) => (
                    <FormRender label="Bowel regime/program:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"laxativeUse"}
                    render={({ field }) => (
                      <FormRender label="Laxative/Enema use:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "Daily", label: "Daily" },
                            { value: "Weekly", label: "Weekly" },
                            { value: "Monthly", label: "Monthly" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"laxativeUseDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isIncotinence"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Incontinence(details if applicable)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"incotinenceDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isDiapers"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Diapers/other</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"diapersDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isIlleostomyColostomy"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Ileostomy/colostomy site(describe skin around
                            stoma):
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"illeostomyColostomyDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isOtherElimination"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"otherEliminationDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>

                <FormField
                  control={methods.control}
                  name={"skinAroundStoma"}
                  render={({ field }) => (
                    <FormRender label="site(describe skin around stoma):">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"isNoEliminationProblem"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">No Problem</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">NUTRITIONAL STATUS</FormHeader>
              <div className="grid grid-col-1 gap-5">
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"nutritionalStatus"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "NAS", label: "NAS" },
                            { value: "NPO", label: "NPO" },
                            {
                              value: "NO-CONCENTRATED-SWEETS",
                              label: "No Concentrated Sweets",
                            },
                            {
                              value: "OTHER-NUTRITIONAL-REQUIREMENTS(DIET",
                              label: "Other Nutritional requirements(diet",
                            },
                          ]}
                          name={"nutritionalStatus"}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"nutritionalStatusDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isIncreaseFluids"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Increase FLuids</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={methods.control}
                        name={"increaseFluidsDetails"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>

                    <p className="text-sm font-medium">amt</p>
                  </div>
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isRestrictFluids"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Restrict FLuids</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={methods.control}
                        name={"restrictFluidsDetails"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>

                    <p className="text-sm font-medium">amt</p>
                  </div>
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"nutritionLaxativeUse"}
                    render={({ field }) => (
                      <FormRender label="Laxative/Enema use:">
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "GOOD", label: "Good" },
                            { value: "FAIR", label: "Fair " },
                            { value: "POOR", label: "Poor " },
                            { value: "ANOREXIC", label: "Anorexic" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"nutritionLaxativeUseEatingPattern"}
                    render={({ field }) => (
                      <FormRender label="Eating patterns">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isVomiting"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Nausea/Vomiting:</span>
                        </div>
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"vomitingFrequency"}
                    render={({ field }) => (
                      <FormRender label="Frequency">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"vomitingAmount"}
                    render={({ field }) => (
                      <FormRender label="Amount">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"isHeatburn"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">
                          Heatburn(food intolerance)
                        </span>
                      </div>
                    </FormRender>
                  )}
                />
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <div className="flex gap-5 items-center">
                    <FormField
                      control={methods.control}
                      name={"isWeightChange"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Weight Change:</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"weightChange"}
                      render={({ field }) => (
                        <FormRender>
                          <RadioInput
                            className="flex-row gap-3 items-start"
                            {...field}
                            options={[
                              { value: "GAIN", label: "Gain" },
                              { value: "LOSS", label: "Loss " },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormField
                        control={methods.control}
                        name={"weightChangeDetails"}
                        render={({ field }) => (
                          <FormRender>
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>

                    <p className="text-sm font-medium">lb</p>
                  </div>
                </div>
                <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isHeatburnX"}
                    render={({ field }) => (
                      <FormRender label="X">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isHeatburnXPeriod"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          options={[
                            { value: "WK", label: "Wk./" },
                            { value: "MO", label: "Mo./" },
                            { value: "YR", label: "Yr." },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid grid-col-1 md:grid-cols-3 border border-dashed p-4 gap-5">
                  <FormField
                    control={methods.control}
                    name={"isOtherNutritionalStatus"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Other(specify,including history)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"otherNutrtionalStatusDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-secondary p-4 font-semibold grid grid-col-1 md:grid-cols-5 gap-5 my-5">
                <p className="md:col-span-3">
                  Directions:Check each with "yes" to assessment,then total
                  score to determine additional risk.
                </p>
                <p>POINTS</p>
                <p>YES</p>
              </div>
              <div className="flex flex-col gap-5">
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Has an illness or condition that changes the kind and/or
                    amount of food eaten
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"hasAnIllness"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Eats fewer than 2 meals per day
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>3</p>
                    <FormField
                      control={methods.control}
                      name={"eatsFewerThan2Meals"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Eats few fruits,vegetables or milk products
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"eatsFewFruits"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Has 3 or more drinks of beer;liquor or wine almost every day
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"has3OrMoreDrinks"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Has tooth or mouth problems that make it hard to eat
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"hasToothOrMouthProblems"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Does not always have enough money to buy the food needed
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>4</p>
                    <FormField
                      control={methods.control}
                      name={"doesNotHaveMoney"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Eats alone most of the time
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>1</p>
                    <FormField
                      control={methods.control}
                      name={"eatsAlone"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Takes 3 or more different prescribed or over-the-counter
                    drugs a day
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>1</p>
                    <FormField
                      control={methods.control}
                      name={"takes3OrMoreDrugs"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Without wanting to,has lost or gained 10 pounds in the last
                    6 months
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"hasLostOrGained"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="text-sm grid grid-col-1 md:grid-cols-5 gap-5 px-4">
                  <p className="font-semibold md:col-span-3">
                    Not always physically able to shop,cook and/or feed self
                  </p>
                  <div className="md:col-span-2 grid grid-cols-2">
                    <p>2</p>
                    <FormField
                      control={methods.control}
                      name={"notAbleToShop"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                              }}
                            />
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-lg font-bold pt-4 border-t border-b my-5">
                Total Score ({getTotalScore()})
              </p>
              <div className="text-sm font-semibold pb-5">
                <p className="text-base">INTERPRETATION</p>
                <p>
                  0-2 Good. As appropriate reasses and/or provide information
                  based on situation.
                </p>
                <p>
                  3-5 Moderate risk. Educate,refer,monitor and reevaluate based
                  on patient situation and organization policy.
                </p>
                <p>
                  6 or greater High risk. Coordinate with
                  physician,dietician,social service professional or nurse about
                  how to improve nutritional health,Reasses nutritional status
                  and educate based on plan of care.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"isNoInterpretationProblem"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">No Problem</span>
                    </div>
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

export default InternalAssessment;
