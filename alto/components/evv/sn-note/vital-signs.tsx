import { zodResolver } from "@hookform/resolvers/zod";
import { User, VitalSigns } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateTimeInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveVitalSigns } from "@/hooks";
import { getFullName, modifyDateFields } from "@/lib";
import {
  vitalSignsDefaultValue,
  VitalSignsFormType,
  vitalSignsSchema,
} from "@/schema";

const VitalSignsForm = ({
  caregiver,
  patientId,
  data,
  snNoteType,
  unscheduledVisitId,
  skilledNursingNoteId,
  callback,
  disabled,
}: {
  patientId: string;
  data: VitalSigns;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  caregiver: User;
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  disabled?: boolean;
}) => {
  const methods = useForm<VitalSignsFormType>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: vitalSignsDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const {
    data: response,
    trigger: saveVitalSigns,
    isMutating,
  } = useSaveVitalSigns();

  useEffect(() => {
    if (response?.success) {
      toast.success("Vital signs saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const vitalSignDetails = useMemo(() => {
    return modifyDateFields({
      ...data,
      nurse: getFullName(caregiver?.firstName, caregiver?.lastName),
    } as VitalSigns);
  }, [caregiver?.firstName, caregiver?.lastName, data]);

  usePopulateForm<VitalSignsFormType, VitalSigns>(
    methods.reset,
    vitalSignDetails,
  );

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          async ({ nurse: _nurse, ...formData }) => {
            await saveVitalSigns({
              ...formData,
              id: data?.id as string,
              unscheduledVisitId,
              skilledNursingNoteId,
              caregiverId: caregiver?.id,
              patientId,
              snNoteType,
            });
          },
        )}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" loading={isMutating} disabled={disabled}>
              Save Changes{" "}
            </Button>
          </div>
          <FormHeader className="mt-4">Visit Information</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"nurse"}
              render={({ field }) => (
                <FormRender label={"Nurse"}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={true}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"scheduledVisitId"}
              render={({ field }) => (
                <FormRender label={"Scheduled Visit"}>
                  <SelectInput options={[]} field={field} disabled={true} />
                </FormRender>
              )}
            />
            <FormField
              disabled={disabled}
              control={methods.control}
              name={"startTime"}
              render={({ field }) => (
                <FormRender label={"Start Time"}>
                  <DateTimeInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
            <FormField
              disabled={disabled}
              control={methods.control}
              name={"endTime"}
              render={({ field }) => (
                <FormRender label={"End Time"}>
                  <DateTimeInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader> Type of Visit</FormHeader>

          <div className="grid gap-5 items-center">
            <FormField
              disabled={disabled}
              control={methods.control}
              name={"visitType"}
              render={({ field }) => {
                return (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-5 lg:items-center"
                      {...field}
                      value={field.value as string}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      options={[
                        { value: "skilled-nursing", label: "Skilled Nursing" },
                        {
                          value: "sn-supervisory",
                          label: "SN and Supervisory",
                        },
                        { value: "supervisory", label: "Supervisory" },
                        { value: "discharge", label: "Discharge" },
                        {
                          value: "telehealth-visit",
                          label: "Telehealth Visit",
                        },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </FormRender>
                );
              }}
            />

            {methods.watch("visitType") === "other" && (
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"otherVisitType"}
                render={({ field }) => (
                  <FormRender label={"Other"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            )}
          </div>
        </div>
        <div>
          <FormHeader> Shift Note</FormHeader>

          <FormField
            control={methods.control}
            name={"shiftNote"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    {
                      value: "additional-vital-checks",
                      label: "Has Additional Vital Checks",
                    },
                    {
                      value: "output-orders",
                      label: "Has Intake/Output Orders",
                    },
                    {
                      value: "additional-treatment",
                      label: "Has Additional Treatment Orders",
                    },
                    { value: "shift-narrative", label: "Has Shift Narrative" },
                    { value: "seizure-log", label: "Has Seizure Log" },
                  ]}
                  name={"shiftNote"}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
        </div>
        <div>
          <FormHeader> Homebound Reason</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"homeboundReason"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    disabled={disabled}
                    options={[
                      {
                        value: "requires-assistance",
                        label: "Requires assistance for most to all ADL",
                      },
                      {
                        value: "unsafe-to-leave",
                        label: "Unsafe to leave home unassisted",
                      },
                      {
                        value: "patient-is-bedridden",
                        label: "Patient is Bedridden",
                      },
                      {
                        value: "medical-restriction",
                        label: "Medical restrictions",
                      },
                      {
                        value: "taxing-effort",
                        label: "Taxing effort to leave home",
                      },
                      {
                        value: "depended-upon-device",
                        label: "Dependent upon supportive device(s)",
                      },
                      { value: "sob-on-exertion", label: "SOB on exertion" },
                      { value: "other", label: "Other" },
                    ]}
                    name={"homeboundReason"}
                  />
                </FormRender>
              )}
            />

            {methods.watch("homeboundReason")?.includes("other") && (
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"otherHomeBoundReason"}
                render={({ field }) => (
                  <FormRender label={"Other"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            )}

            <FormField
              disabled={disabled}
              control={methods.control}
              name={"homeboundComment"}
              render={({ field }) => (
                <FormRender label={"Comments"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader> Vital Signs</FormHeader>

          <div className="grid grid-col-1 xl:grid-cols-2 gap-5 items-start">
            <div className="flex flex-col gap-2 border rounded">
              <div className="grid grid-col-1 lg:grid-cols-3 items-center border border-dashed p-4 gap-5">
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"temperature"}
                  render={({ field }) => (
                    <FormRender label={"Temperature"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div className="lg:col-span-2">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"temperatureType"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row flex-wrap gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "ORAL", label: "Oral" },
                            { value: "AUXILLARY", label: "Axillary" },
                            { value: "RECTAL", label: "Rectal" },
                            { value: "TYMPANIC", label: "Tympanic" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-col-1 lg:grid-cols-3 items-center border border-dashed gap-5 p-4">
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"pulse"}
                  render={({ field }) => (
                    <FormRender label={"Pulse"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />

                <div className="flex flex-col lg:col-span-2 gap-2">
                  <div className="pb-2 border-b">
                    <FormField
                      disabled={disabled}
                      control={methods.control}
                      name={"pulseType"}
                      render={({ field }) => (
                        <FormRender>
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "RADIAL", label: "Radial" },
                              { value: "APICAL", label: "Apical" },
                              { value: "BRACHIAL", label: "Brachial" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"pulseTypeRegular"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "REGULAR", label: "Regular" },
                            { value: "IRREGULAR", label: "Irregular" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-col-1 lg:grid-cols-3 border border-dashed p-4 items-center  gap-5">
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"respiration"}
                  render={({ field }) => (
                    <FormRender label={"Respirations"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />

                <div className="lg:col-span-2">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"respirationType"}
                    render={({ field }) => (
                      <FormRender>
                        <RadioInput
                          className="flex-row gap-3 items-start"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "REGULAR", label: "Regular" },
                            { value: "IRREGULAR", label: "Irregular" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div className="px-4 pb-2">
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={`notes`}
                  render={({ field }) => (
                    <FormRender label={"Notes"}>
                      <Textarea
                        {...field}
                        value={field.value as string}
                        rows={10}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
                <div>
                  <p className="font-semibold pb-2">Blood Pressure</p>
                  <div className="grid grid-col-1 md:grid-cols-2 items-center gap-5">
                    <FormField
                      disabled={disabled}
                      control={methods.control}
                      name={"bloodPressureRight"}
                      render={({ field }) => (
                        <FormRender label={"RIGHT"}>
                          <Input
                            {...field}
                            value={field.value as string}
                            placeholder="ex: 160/125"
                          />
                        </FormRender>
                      )}
                    />

                    <FormField
                      disabled={disabled}
                      control={methods.control}
                      name={"bloodPressureLeft"}
                      render={({ field }) => (
                        <FormRender label={"LEFT"}>
                          <Input
                            {...field}
                            value={field.value as string}
                            placeholder="ex: 160/125"
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      disabled={disabled}
                      control={methods.control}
                      name={"bloodPressureType"}
                      render={({ field }) => (
                        <FormRender>
                          <RadioInput
                            className="gap-5 items-center flex-row"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "LYING", label: "Lying" },
                              { value: "STANDING", label: "Standing" },
                              { value: "SITTING", label: "Sitting" },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="border-b-border border-b mt-4" />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"bloodPressureWeight"}
                    render={({ field }) => (
                      <FormRender label={"Weight"} formClassName="mt-2">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-5 border mt-2 p-2 rounded">
                <div className="grid grid-col-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={methods.control}
                      name={"painDenied"}
                      render={({ field }) => (
                        <FormRender formClassName="self-center">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={disabled}
                            />
                            <span className="text-sm">Patient Denies Pain</span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"painLocation"}
                    render={({ field }) => (
                      <FormRender label={"Pain Location"}>
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={methods.watch("painDenied") || disabled}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"painIntensity"}
                    render={({ field }) => (
                      <FormRender
                        label={"Pain Intensity"}
                        helperText="scale of 0 to 10"
                      >
                        <Input
                          {...field}
                          value={field.value as string}
                          type="number"
                          placeholder="(0 to 10)"
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"painDuration"}
                    render={({ field }) => (
                      <FormRender label={"Pain Duration"}>
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={methods.watch("painDenied") || disabled}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"otherPain"}
                    render={({ field }) => (
                      <FormRender label={"Pain Other"}>
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={methods.watch("painDenied") || disabled}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"painLevel"}
                    render={({ field }) => (
                      <FormRender label={"Patient's acceptable pain level"}>
                        <Input
                          {...field}
                          value={field.value as string}
                          type="number"
                          placeholder="(0 to 10)"
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"medicationTaken"}
                    render={({ field }) => (
                      <FormRender label={"Medication last taken"}>
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={methods.watch("painDenied") || disabled}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"painDescription"}
                    render={({ field }) => (
                      <FormRender label={"Pain Description"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"painManagement"}
                    render={({ field }) => (
                      <FormRender label={"Other Pain Management Intervention"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
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

export default VitalSignsForm;
