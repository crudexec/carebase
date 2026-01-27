import { zodResolver } from "@hookform/resolvers/zod";
import { CardioPulmonary, User } from "@prisma/client";
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
  SelectInput,
} from "@/components/ui";
import { usePopulateForm, useSaveCardioPulm } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  cardioPulmDefaultValue,
  CardioPulmForm,
  cardioPulmSchema,
} from "@/schema";

const CardioPulmComponent = ({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  snNoteType,
  callback,
  data,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  caregiver: User;
  callback: (skilledNursingNote?: string) => void;
  data: CardioPulmonary;
  disabled?: boolean;
}) => {
  const methods = useForm<CardioPulmForm>({
    resolver: zodResolver(cardioPulmSchema),
    defaultValues: cardioPulmDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveCardioPulm();

  useEffect(() => {
    if (response?.success) {
      toast.success("Cardio Plum detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const cardioPlum = useMemo(() => {
    return modifyDateFields({ ...data } as CardioPulmonary);
  }, [data]);

  usePopulateForm<CardioPulmForm, CardioPulmonary>(methods.reset, cardioPlum);

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
              Save Changes
            </Button>
          </div>
          <FormHeader className="mt-4">Cardiovascular</FormHeader>
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 lg:items-center">
            <FormField
              control={methods.control}
              name={"cardiovascularNormal"}
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

            <div className="border border-dashed p-2 flex-1 rounded">
              <p className="font-medium text-sm pb-2">Heart Sounds</p>
              <div className="flex flex-col lg:flex-row gap-5">
                <FormField
                  control={methods.control}
                  name={"heartSound"}
                  render={({ field }) => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <RadioInput
                        {...field}
                        value={field.value as string}
                        className="flex flex-row gap-4"
                        options={[
                          { value: "regular", label: "Regular" },
                          { value: "irregular", label: "Irregular" },
                          { value: "murmur", label: "Murmur" },
                        ]}
                        disabled={
                          methods.watch("cardiovascularNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <p className="font-medium text-sm">Heart Sounds Note</p>
                  <FormField
                    control={methods.control}
                    name={"heartSoundNote"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            methods.watch("cardiovascularNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            <div className="border border-dashed rounded p-2 flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={"edema"}
                render={() => (
                  <FormRender
                    label="Edema"
                    type="checkbox"
                    formClassName="flex-wrap"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "sacral", label: "Sacral" },
                        { value: "pitting", label: "Pitting" },
                        { value: "non-pitting", label: "Non-Pitting" },
                        { value: "claudication", label: "Claudication" },
                        { value: "pedal", label: "Pedal" },
                      ]}
                      name={"edema"}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"edemaSeverity"}
                render={({ field }) => (
                  <FormRender label={"Severity"}>
                    <SelectInput
                      options={[
                        { value: "1", label: "+1" },
                        { value: "2", label: "+2" },
                        { value: "3", label: "+3" },
                        { value: "4", label: "+4" },
                      ]}
                      field={field}
                      placeholder="Select A Severity"
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"edemaLocation"}
                render={({ field }) => (
                  <FormRender label={"Location"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-5 border border-dashed rounded p-2">
              <FormField
                control={methods.control}
                name={"chestPain"}
                render={({ field }) => (
                  <FormRender label="Chest Pain" formClassName="lg:col-span-2">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          methods.watch("cardiovascularNormal") || disabled
                        }
                      />
                      <span className="text-sm">No Chest Pain</span>
                    </div>
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"chestPainLocation"}
                render={() => (
                  <FormRender
                    label="Location"
                    type="checkbox"
                    formClassName="flex-col gap-2"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "substernal", label: "Substernal" },
                        { value: "left", label: "Left Shoulder/Hand" },
                      ]}
                      name={"chestPainLocation"}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"otherChestPainLocation"}
                render={({ field }) => (
                  <FormRender label="Other">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"painDuration"}
                render={({ field }) => (
                  <FormRender label="Duration">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"painIntensity"}
                render={({ field }) => (
                  <FormRender
                    label="Pain Intensity"
                    helperText="scale of 0 to 10"
                  >
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"painType"}
                render={() => (
                  <FormRender
                    label="Type"
                    formClassName="flex flex-col md:flex-row flex-wrap md:items-center gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "dull", label: "Dull" },
                        { value: "aching", label: "Aching" },
                        { value: "sharp", label: "Sharp" },
                        { value: "anginal", label: "Anginal" },
                        { value: "radiating", label: "Radiating" },
                      ]}
                      name={"painType"}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"relievingFactor"}
                render={({ field }) => (
                  <FormRender label="Aggravating/Relieving Factors ">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("cardiovascularNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div className="mt-5">
            <FormField
              control={methods.control}
              name={"cardiovascularNote"}
              render={({ field }) => (
                <FormRender label="Cardiovascular Note">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader>Pulmonary</FormHeader>

          <div className="flex flex-col lg:flex-row  gap-5 mb-5 lg:gap-10">
            <FormField
              control={methods.control}
              name={"pulmonaryNormal"}
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

            <div className="flex-1 gap-5 flex flex-col">
              <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
                <div>
                  <p className="text-sm font-bold pb-2">Lung Sounds</p>
                  <FormField
                    control={methods.control}
                    name={"lungSound"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "clear", label: "Clear" },
                            { value: "crackles", label: "Crackles" },
                            { value: "rales", label: "Rales" },
                            { value: "wheeze", label: "Wheeze" },
                            { value: "rhonchi", label: "Rhonchi" },
                            { value: "diminished", label: "Diminished" },
                            { value: "absent", label: "Absent" },
                          ]}
                          name={"lungSound"}
                          disabled={
                            methods.watch("pulmonaryNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div>
                  <p className="text-sm font-bold pb-2">Anterior</p>
                  <FormField
                    control={methods.control}
                    name={"anterior"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "right", label: "Right" },
                            { value: "left", label: "Left" },
                          ]}
                          name={"anterior"}
                          disabled={
                            methods.watch("pulmonaryNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div>
                  <p className="text-sm font-bold pb-2">Posterior</p>
                  <FormField
                    control={methods.control}
                    name={"posterior"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "right-upper", label: "Right Upper" },
                            { value: "right-lower", label: "Right Lower" },
                            { value: "left-upper", label: "Left Upper" },
                            { value: "left-lower", label: "Left Lower" },
                          ]}
                          name={"posterior"}
                          disabled={
                            methods.watch("pulmonaryNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
                <div>
                  <p className="text-sm font-bold pb-2">Cough</p>
                  <FormField
                    control={methods.control}
                    name={"cough"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "none", label: "None" },
                            { value: "acute", label: "Acute" },
                            { value: "chronic", label: "Chronic" },
                            { value: "dry", label: "Dry" },
                            { value: "productive", label: "Productive" },
                            {
                              value: "unable-to-cough",
                              label: "Unable to cough secretions",
                            },
                            {
                              value: "suction-needed",
                              label: "Suction Needed",
                            },
                            { value: "hemoptysis", label: "Hemoptysis" },
                          ]}
                          name={"cough"}
                          disabled={
                            methods.watch("pulmonaryNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={methods.control}
                name={"coughNote"}
                render={({ field }) => (
                  <FormRender label="Cough Note">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={methods.watch("pulmonaryNormal") || disabled}
                    />
                  </FormRender>
                )}
              />

              <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
                <div>
                  <p className="text-sm font-bold pb-2">Respiratory Status</p>
                  <FormField
                    control={methods.control}
                    name={"respiratoryStatus"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "sob", label: "SOB" },
                            { value: "dyspnea", label: "Dyspnea" },
                            { value: "orthopnea", label: "Orthopnea" },
                            { value: "prn", label: "PRN" },
                            { value: "continuous", label: "Continuous" },
                          ]}
                          name={"respiratoryStatus"}
                          disabled={
                            methods.watch("pulmonaryNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"oxygen"}
                    render={({ field }) => (
                      <FormRender label="Oxygen">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("pulmonaryNormal") || disabled
                              }
                            />
                          </div>
                          <p className="font-medium text-sm">LPM</p>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"pulseOximetry"}
                    render={({ field }) => (
                      <FormRender label="Pulse Oximetry">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("pulmonaryNormal") || disabled
                              }
                            />
                          </div>
                          <p className="font-medium text-sm">%</p>
                        </div>
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <FormField
            control={methods.control}
            name={"pulmonaryNote"}
            render={({ field }) => (
              <FormRender label="Pulmonary Note">
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="lungs CTA bilaterally"
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>{" "}
      </form>
    </Form>
  );
};

export default CardioPulmComponent;
