import { zodResolver } from "@hookform/resolvers/zod";
import { GenitoEndo, User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
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
import { usePopulateForm, useSaveGenitoEndo } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  genitoEndoDefaultValue,
  GenitoEndoForm,
  genitoEndoSchema,
} from "@/schema";

const GenitoEndoComponent = ({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  data,
  snNoteType,
  callback,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  caregiver?: User;
  data: GenitoEndo;
  callback: (skilledNursingNote?: string) => void;
  disabled?: boolean;
}) => {
  const methods = useForm<GenitoEndoForm>({
    resolver: zodResolver(genitoEndoSchema),
    defaultValues: genitoEndoDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveGenitoEndo();

  useEffect(() => {
    if (response?.success) {
      toast.success("Genito Endo detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const genitoEndo = useMemo(() => {
    return modifyDateFields({ ...data } as GenitoEndo);
  }, [data]);

  usePopulateForm<GenitoEndoForm, GenitoEndo>(methods.reset, genitoEndo);

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
          <FormHeader className="mt-4">Genitourinary</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"genitourinaryNormal"}
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormField
                control={methods.control}
                name={"urineFrequency"}
                render={({ field }) => (
                  <FormRender label={"Urine Frequency"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("genitourinaryNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"urineColor"}
                render={({ field }) => (
                  <FormRender label={"Urine Color"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("genitourinaryNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"urineOdor"}
                render={({ field }) => (
                  <FormRender label={"Urine Odor"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        methods.watch("genitourinaryNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="border border-dashed p-2 rounded">
              <p className="text-sm font-medium pb-2">Symptoms</p>
              <FormField
                control={methods.control}
                name={"symptoms"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "incontinence", label: "Incontinence" },
                        { value: "urgency", label: "Urgency" },
                        { value: "hesitancy", label: "Hesitancy" },
                        { value: "dysuria", label: "Dysuria" },
                        { value: "nocturia", label: "Nocturia" },
                        { value: "oliguria", label: "Oliguria" },
                        { value: "retention", label: "Retention" },
                      ]}
                      name={"symptoms"}
                      disabled={
                        methods.watch("genitourinaryNormal") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <div className="border border-dashed p-2 rounded">
              <p className="text-sm font-medium pb-2">Urinary Cathether</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField
                  control={methods.control}
                  name={"urinaryCathetherType"}
                  render={({ field }) => (
                    <FormRender label="Type">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          methods.watch("genitourinaryNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"urinaryCathetherSize"}
                  render={({ field }) => (
                    <FormRender label="Size">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={
                              methods.watch("genitourinaryNormal") || disabled
                            }
                          />
                        </div>
                        <p className="text-sm font-medium text-primary">
                          French
                        </p>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"urinaryCathetherLastChanged"}
                  render={({ field }) => (
                    <FormRender label="Last Changed">
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        disabled={
                          methods.watch("genitourinaryNormal") || disabled
                        }
                      />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"urinaryCathetherIrrigation"}
                  render={({ field }) => (
                    <FormRender label="Irrigation">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={
                              methods.watch("genitourinaryNormal") || disabled
                            }
                          />
                        </div>
                        <p className="text-sm font-medium text-primary">mL</p>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"urinaryCathetherBulbInflated"}
                  render={({ field }) => (
                    <FormRender label="Bulb inflated" formClassName="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={
                              methods.watch("genitourinaryNormal") || disabled
                            }
                          />
                        </div>
                        <p className="text-sm font-medium text-primary">mL</p>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <FormField
              control={methods.control}
              name={"genitourinaryNote"}
              render={({ field }) => (
                <FormRender label={"Genitourinary Note"}>
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
          <FormHeader>Endocrine</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"endocrineNormal"}
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

            <div className="border border-dashed p-2 rounded">
              <p className="text-sm font-medium pb-2">Blood Sugar</p>

              <div className="grid grid-col-1 lg:grid-cols-2 gap-5 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-sm font-medium">Glucometer Reading</p>
                  <FormField
                    control={methods.control}
                    name={"glucometerReading"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            methods.watch("endocrineNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <FormField
                  control={methods.control}
                  name={"bloodSugarFasting"}
                  render={({ field }) => {
                    return (
                      <FormRender>
                        <RadioInput
                          className="flex-row gap-5 items-center"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "fasting", label: "Fasting" },
                            { value: "postprandial", label: "Postprandial" },
                          ]}
                          disabled={
                            methods.watch("endocrineNormal") || disabled
                          }
                        />
                      </FormRender>
                    );
                  }}
                />

                <FormField
                  control={methods.control}
                  name={"testingFrequency"}
                  render={({ field }) => {
                    return (
                      <FormRender
                        label={"Frequency of testing"}
                        formClassName="lg:col-span-2"
                      >
                        <RadioInput
                          className="flex-row gap-5 items-center flex-wrap"
                          {...field}
                          value={field.value as string}
                          options={[
                            { value: "daily", label: "Daily" },
                            {
                              value: "more-than-once-a-day",
                              label: "More Than Once a Day",
                            },
                            { value: "ac-hs", label: "AC & HS" },
                            { value: "none", label: "None" },
                          ]}
                          disabled={
                            methods.watch("endocrineNormal") || disabled
                          }
                        />
                      </FormRender>
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={"diabetesControlledWith"}
                render={() => (
                  <FormRender
                    label="Diabetes Controlled with"
                    formClassName="flex flex-col md:flex-row  flex-wrap md:items-center gap-5 !space-y-0"
                  >
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "insulin", label: "Insulin" },
                        {
                          value: "oral-hypoglycemics",
                          label: "Oral Hypoglycemics",
                        },
                        { value: "diet", label: "Diet" },
                      ]}
                      name={"diabetesControlledWith"}
                      disabled={methods.watch("endocrineNormal") || disabled}
                    />
                  </FormRender>
                )}
              />

              <div className="flex flex-col md:flex-row flex-wrap gap-5 md:items-center">
                <FormField
                  control={methods.control}
                  name={"administeredBy"}
                  render={() => (
                    <FormRender
                      label="Monitored / Administered by"
                      formClassName="flex flex-col md:flex-row  flex-wrap md:items-center gap-5 !space-y-0"
                    >
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "self", label: "Self" },
                          { value: "family", label: "Family" },
                          { value: "hh-staff", label: "HH Staff" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"administeredBy"}
                        disabled={methods.watch("endocrineNormal") || disabled}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherAdministeredBy"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        disabled={
                          !methods.watch("administeredBy").includes("other") ||
                          disabled
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                <p className="text-sm font-semibold">Hypo/Hyperglycemia</p>

                <div className="flex items-center gap-2 flex-1">
                  <p className="text-sm font-medium">Frequency</p>
                  <FormField
                    control={methods.control}
                    name={"hypoFrequency"}
                    render={({ field }) => (
                      <FormRender formClassName="flex-1">
                        <Input
                          {...field}
                          value={field.value as string}
                          disabled={
                            methods.watch("endocrineNormal") || disabled
                          }
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    Patient aware of Signs and Symptoms?
                  </p>
                  <FormField
                    control={methods.control}
                    name={"patientAware"}
                    render={({ field }) => {
                      return (
                        <FormRender>
                          <RadioInput
                            className="grid grid-cols-2 gap-5 items-center"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" },
                            ]}
                            disabled={
                              methods.watch("endocrineNormal") || disabled
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
                name={"endocrineNote"}
                render={({ field }) => (
                  <FormRender label={"Endocrine Note"} formClassName="flex-1">
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
            Save Changes{" "}
          </Button>
        </div>{" "}
      </form>
    </Form>
  );
};

export default GenitoEndoComponent;
