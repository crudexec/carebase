import { zodResolver } from "@hookform/resolvers/zod";
import { NeuroGastro, User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveNeuroGastro } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  neuroGastroDefaultValue,
  NeuroGastroForm,
  neuroGastroSchema,
} from "@/schema";

const NeuroGastroFormTab = ({
  caregiver,
  unscheduledVisitId,
  patientId,
  snNoteType,
  skilledNursingNoteId,
  callback,
  data,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  caregiver?: User;
  callback: (skilledNursingNote?: string) => void;
  data: NeuroGastro;
  disabled?: boolean;
}) => {
  const methods = useForm<NeuroGastroForm>({
    resolver: zodResolver(neuroGastroSchema),
    defaultValues: neuroGastroDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveNeuroGastro();

  useEffect(() => {
    if (response?.success) {
      toast.success("Neuro Gastro detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const neuroGastro = useMemo(() => {
    return modifyDateFields({ ...data } as NeuroGastro);
  }, [data]);

  usePopulateForm<NeuroGastroForm, NeuroGastro>(methods.reset, neuroGastro);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            unscheduledVisitId,
            skilledNursingNoteId,
            caregiverId: caregiver?.id,
            patientId,
            snNoteType,
          });
        })}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" loading={isMutating} disabled={disabled}>
              Save Changes{" "}
            </Button>
          </div>
          <FormHeader className="mt-4">Neuromuscular</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"neuromuscularNormal"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Normal</span>
                  </div>
                </FormRender>
              )}
            />

            <div className="grid lg:grid-cols-2 gap-5 items-center">
              <div className="border border-dashed p-2 rounded flex flex-col gap-5">
                <div>
                  <p className="text-sm font-medium pb-2">Mental Status</p>
                  <FormField
                    control={methods.control}
                    name={"mentalStatus"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "disoriented", label: "Disoriented" },
                            { value: "agitated", label: "Agitated" },
                            { value: "forgetful", label: "Forgetful" },
                            { value: "depressed", label: "Depressed" },
                          ]}
                          name={"mentalStatus"}
                          disabled={
                            methods.watch("neuromuscularNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium pb-2">
                    Alert and oriented to
                  </p>
                  <FormField
                    control={methods.control}
                    name={"mentalStatusOrientedTo"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "person", label: "Person" },
                            { value: "place", label: "Place" },
                            { value: "time", label: "Time" },
                          ]}
                          name={"mentalStatusOrientedTo"}
                          disabled={
                            methods.watch("neuromuscularNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="rounded flex flex-col gap-5">
                <FormField
                  control={methods.control}
                  name={"headache"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            methods.watch("neuromuscularNormal") || disabled
                          }
                        />
                        <span className="text-sm">Headache</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"impairment"}
                  render={() => (
                    <FormRender
                      label="Impairment"
                      formClassName="flex flex-col md:flex-row flex-wrap md:items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "visual", label: "Visual" },
                          { value: "speech", label: "Speech" },
                          { value: "hearing", label: "Hearing" },
                        ]}
                        name={"impairment"}
                        disabled={
                          methods.watch("neuromuscularNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"markApplicableNeuro"}
                  render={() => (
                    <FormRender
                      label="Mark Applicable"
                      formClassName="flex flex-col md:flex-row  flex-wrap md:items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "syncope", label: "Syncope" },
                          { value: "vertigo", label: "Vertigo" },
                          { value: "ataxia", label: "Ataxia" },
                        ]}
                        name={"markApplicableNeuro"}
                        disabled={
                          methods.watch("neuromuscularNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Grip strength</p>
                <FormField
                  control={methods.control}
                  name={"gripStrength"}
                  render={({ field }) => {
                    return (
                      <FormRender>
                        <RadioInput
                          className="grid grid-cols-2 gap-5 items-center"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "equal", label: "Equal" },
                            { value: "unequal", label: "Unequal" },
                          ]}
                          disabled={
                            methods.watch("neuromuscularNormal") || disabled
                          }
                        />
                      </FormRender>
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-medium">Grasp Left</p>
                <FormField
                  control={methods.control}
                  name={"gripLeft"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                  disabled={methods.watch("neuromuscularNormal") || disabled}
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-medium">Grasp Right</p>
                <FormField
                  control={methods.control}
                  name={"gripRight"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                  disabled={methods.watch("neuromuscularNormal") || disabled}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Pupils</p>
                <FormField
                  control={methods.control}
                  name={"pupils"}
                  render={({ field }) => {
                    return (
                      <FormRender>
                        <RadioInput
                          className="grid grid-cols-2 gap-5 items-center"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "perrla", label: "PERRLA" },
                            { value: "unequal", label: "Unequal" },
                          ]}
                          disabled={
                            methods.watch("neuromuscularNormal") || disabled
                          }
                        />
                      </FormRender>
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-medium">Other</p>
                <FormField
                  control={methods.control}
                  name={"otherPupils"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                  disabled={methods.watch("neuromuscularNormal") || disabled}
                />
              </div>
            </div>
            <div className="grid items-center gap-5">
              <FormField
                control={methods.control}
                name={"falls"}
                render={({ field }) => (
                  <FormRender label="Falls">
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
                disabled={methods.watch("neuromuscularNormal") || disabled}
              />
              <FormField
                control={methods.control}
                name={"neuromuscularNote"}
                render={({ field }) => (
                  <FormRender label="Neuromuscular Note">
                    <Textarea
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="pb-5">
          <FormHeader>Gastrointestinal</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"gastrointestinalNormal"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Normal</span>
                  </div>
                </FormRender>
              )}
            />
            <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
              <div>
                <p className="text-sm font-medium pb-2">Bowel Sounds</p>
                <FormField
                  control={methods.control}
                  name={"bowelSounds"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "abnormal", label: "Abnormal" },
                          { value: "hypoactive", label: "Hypoactive" },
                          { value: "hyperactive", label: "Hyperactive" },
                        ]}
                        name={"bowelSounds"}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"bowelSoundsNote"}
                render={({ field }) => (
                  <FormRender label="Note" formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("gastrointestinalNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="border border-dashed p-2 rounded">
              <p className="text-sm font-medium pb-2">Abdominal Pain</p>
              <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
                <FormField
                  control={methods.control}
                  name={"abdominalPainNone"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            methods.watch("gastrointestinalNormal") || disabled
                          }
                        />
                        <span className="text-sm">None</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"abdominalPain"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "continuous", label: "Continuous" },
                          { value: "intermittent", label: "Intermittent" },
                          { value: "non-tender", label: "Non-tender" },
                          { value: "diffuse", label: "Diffuse" },
                          { value: "localized", label: "Localized" },
                        ]}
                        name={"abdominalPain"}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />

                <div className="flex items-center gap-2 flex-1">
                  <p className="text-sm">Note</p>
                  <FormField
                    control={methods.control}
                    name={"abdominalPainNote"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            methods.watch("gastrointestinalNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={"apetite"}
                render={({ field }) => {
                  return (
                    <FormRender label={"Appetite"}>
                      <RadioInput
                        className="grid md:grid-cols-3 gap-5 items-center"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "good", label: "Good" },
                          { value: "fair", label: "Fair" },
                          { value: "poor", label: "Poor" },
                        ]}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  );
                }}
              />
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"nutritionalRequirement"}
                  render={({ field }) => (
                    <FormRender label={"Diet/Nutritional Requirements"}>
                      <Textarea
                        {...field}
                        value={field.value as string}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />

                <div className="flex flex-col gap-5">
                  <FormField
                    control={methods.control}
                    name={"tubeFeeding"}
                    render={({ field }) => (
                      <FormRender label={"Tube Feeding"} formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            methods.watch("gastrointestinalNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={"tubeFeedingContinuous"}
                    render={({ field }) => {
                      return (
                        <FormRender>
                          <RadioInput
                            className="grid grid-cols-2 gap-5 items-center"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "continuous", label: "Continuous" },
                              { value: "intermittent", label: "Intermittent" },
                            ]}
                            disabled={
                              methods.watch("gastrointestinalNormal") ||
                              disabled
                            }
                          />
                        </FormRender>
                      );
                    }}
                  />
                </div>
              </div>
              <FormField
                control={methods.control}
                name={"npo"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                      <span className="text-sm">NPO</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>

            <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
              <p className="text-sm font-semibold">Bowel Movements</p>
              <FormField
                control={methods.control}
                name={"bowelMovementNormal"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                      <span className="text-sm">Normal</span>
                    </div>
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"bowelMovement"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "distention", label: "Distention" },
                        { value: "flatulence", label: "Flatulence" },
                        { value: "diarrhea", label: "Diarrhea" },
                        { value: "constipation", label: "Constipation" },
                        { value: "incontinence", label: "Incontinence" },
                        { value: "impaction", label: "Impaction" },
                      ]}
                      name={"bowelMovement"}
                      disabled={
                        methods.watch("gastrointestinalNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"lastBM"}
                  render={({ field }) => (
                    <FormRender label={"Last BM"} formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"enema"}
                  render={({ field }) => (
                    <FormRender label={"Enema"} formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          methods.watch("gastrointestinalNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"markApplicableGastro"}
                render={() => (
                  <FormRender
                    label={"Mark Applicable"}
                    formClassName="flex flex-col md:flex-row flex-wrap md:items-center gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "colostomy", label: "Colostomy" },
                        { value: "ileostomy", label: "Ileostomy" },
                      ]}
                      name={"markApplicableGastro"}
                      disabled={
                        methods.watch("gastrointestinalNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"gastrointestinalNote"}
                render={({ field }) => (
                  <FormRender
                    label={"Gastrointestinal Note"}
                    formClassName="lg:col-span-2"
                  >
                    <Textarea
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NeuroGastroFormTab;
