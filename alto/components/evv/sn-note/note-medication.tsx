import { zodResolver } from "@hookform/resolvers/zod";
import { NoteMedication, User } from "@prisma/client";
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
import { usePopulateForm, useSaveNoteMedication } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  noteMedicationDefaultValue,
  NoteMedicationForm,
  noteMedicationSchema,
} from "@/schema";

const Medication = ({
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
  caregiver?: User;
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  data: NoteMedication;
  disabled?: boolean;
}) => {
  const methods = useForm<NoteMedicationForm>({
    resolver: zodResolver(noteMedicationSchema),
    defaultValues: noteMedicationDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveNoteMedication();

  useEffect(() => {
    if (response?.success) {
      toast.success("Note medication detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const noteMedication = useMemo(() => {
    return modifyDateFields({ ...data } as NoteMedication);
  }, [data]);

  usePopulateForm<NoteMedicationForm, NoteMedication>(
    methods.reset,
    noteMedication,
  );

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
          <FormHeader className="mt-4">Medications</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5 items-center">
            <FormField
              control={methods.control}
              name={"medicationChanged"}
              render={({ field }) => {
                return (
                  <FormRender>
                    <RadioInput
                      className="flex-row gap-5 items-center"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "unchanged", label: "Unchanged" },
                        { value: "changed", label: "New/Changed" },
                      ]}
                      disabled={disabled}
                    />
                  </FormRender>
                );
              }}
            />

            <div className="flex items-center gap-2 flex-1">
              <p className="text-sm font-medium">Drug/Dose/Frequency:</p>
              <FormField
                control={methods.control}
                name={"medicationDose"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"medicationUpdated"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      {
                        value: "medication-list",
                        label: "Medication List Reviewed and Updated ",
                      },
                      { value: "allergy-updated", label: "Allergy Updated" },
                    ]}
                    name={"medicationUpdated"}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <div className="flex items-center gap-2 flex-1">
              <p className="text-sm font-medium">Allergy Note:</p>
              <FormField
                control={methods.control}
                name={"allergyNote"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
              <p className="text-sm font-medium">Administered By</p>

              <FormField
                control={methods.control}
                name={"administeredBy"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 items-center"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "self", label: "Self" },
                          { value: "family", label: "Family" },
                          { value: "hha-staff", label: "HHA Staff" },
                          { value: "other", label: "Other" },
                        ]}
                        disabled={disabled}
                      />
                    </FormRender>
                  );
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-1">
              <p className="text-sm font-medium">Other Administered By:</p>
              <FormField
                control={methods.control}
                name={"otherAdministeredBy"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("administeredBy") !== "other" || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"missedDoses"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Missed Doses</span>
                  </div>
                </FormRender>
              )}
            />

            <div className="flex items-center gap-2 flex-1">
              <p className="text-sm font-medium">Missed Dose Note:</p>
              <FormField
                control={methods.control}
                name={"missedDoseNote"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"medicationNote"}
              render={({ field }) => (
                <FormRender
                  label={"Medication Note"}
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
        <div className="mb-5">
          <FormHeader> IV Therapy</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"therapyNA"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">NA</span>
                  </div>
                </FormRender>
              )}
            />

            <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <p className="text-sm font-medium">Route:</p>
                <FormField
                  control={methods.control}
                  name={"therapyRoute"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "picc-line", label: "PICC Line" },
                          { value: "peripheral", label: "Peripheral" },
                          { value: "implanted-port", label: "Implanted Port" },
                        ]}
                        name={"therapyRoute"}
                        disabled={methods.watch("therapyNA") || disabled}
                      />
                    </FormRender>
                  )}
                />

                <div className="flex items-center gap-2 flex-1">
                  <p className="text-sm font-medium">Site:</p>
                  <FormField
                    control={methods.control}
                    name={"therapySite"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                    disabled={methods.watch("therapyNA") || disabled}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <p className="text-sm font-medium">Dressing Change:</p>
                <FormField
                  control={methods.control}
                  name={"dressingChange"}
                  render={({ field }) => {
                    return (
                      <FormRender>
                        <RadioInput
                          className="flex-row flex-wrap gap-5 items-center"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "self", label: "Self" },
                            { value: "family", label: "Family" },
                            { value: "hha-staff", label: "HHA Staff" },
                            { value: "other", label: "Other" },
                          ]}
                          disabled={methods.watch("therapyNA") || disabled}
                        />
                      </FormRender>
                    );
                  }}
                />

                <FormField
                  control={methods.control}
                  name={"otherDressingChange"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          methods.watch("dressingChange") !== "other" ||
                          disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-5">
                <p className="text-sm font-medium">Line Flush:</p>
                <div className="flex-1 flex flex-col gap-5">
                  <div className="flex flex-col lg:flex-row gap-5">
                    <FormField
                      control={methods.control}
                      name={"lineFlush"}
                      render={({ field }) => {
                        return (
                          <FormRender>
                            <RadioInput
                              className="flex-row flex-wrap gap-5 items-center"
                              {...field}
                              value={field.value as string}
                              options={[
                                { value: "self", label: "Self" },
                                { value: "family", label: "Family" },
                                { value: "hha-staff", label: "HHA Staff" },
                                { value: "other", label: "Other" },
                              ]}
                              disabled={methods.watch("therapyNA") || disabled}
                            />
                          </FormRender>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherLineFlush"}
                      render={({ field }) => (
                        <FormRender formClassName="flex-1">
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={
                              methods.watch("lineFlush") !== "other" || disabled
                            }
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <FormField
                    control={methods.control}
                    name={"lineFlushSaline"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "saline", label: "Saline" },
                            { value: "heparin", label: "Heparin" },
                          ]}
                          name={"lineFlushSaline"}
                          disabled={methods.watch("therapyNA") || disabled}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <p className="text-sm font-medium">Teaching Provided to:</p>
                <FormField
                  control={methods.control}
                  name={"teachingProvidedTo"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "family", label: "Family" },
                          { value: "patient", label: "Patient" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"teachingProvidedTo"}
                        disabled={methods.watch("therapyNA") || disabled}
                      />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherTeachingProvidedTo"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          !methods
                            .watch("teachingProvidedTo")
                            ?.includes("other") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <FormField
                  control={methods.control}
                  name={"teachingResponse"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "return-demonstration",
                            label: "Return Demonstration",
                          },
                          {
                            value: "more-teaching-needed",
                            label: "More teaching needed",
                          },
                          { value: "other", label: "Other" },
                        ]}
                        name={"teachingResponse"}
                        disabled={methods.watch("therapyNA") || disabled}
                      />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"otherTeachingResponse"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          !methods
                            .watch("teachingResponse")
                            ?.includes("other") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <p className="text-sm font-medium">IV Therapy Note:</p>
                <FormField
                  control={methods.control}
                  name={"therapyNote"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={methods.watch("therapyNA") || disabled}
                      />
                    </FormRender>
                  )}
                />
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

export default Medication;
