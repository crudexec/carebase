import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import {
  familySupportiveDefaultValues,
  FamilySupportiveForm,
  familySupportiveSchema,
} from "@/schema/clinical/assessment/non-oasis/living/living-financial/family-support";

const FamilySupportive = ({
  assessmentId,
  data,
  livingFinancial,
  callback,
  caregiver,
  disabled,
  dateCompleted,
  patientId,
}: {
  assessmentId?: string;
  data: FamilySupportiveForm;
  livingFinancial: object;
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  dateCompleted?: Date;
}) => {
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const methods = useForm<FamilySupportiveForm>({
    resolver: zodResolver(familySupportiveSchema),
    defaultValues: familySupportiveDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  usePopulateForm<FamilySupportiveForm, FamilySupportiveForm>(
    methods.reset,
    data,
  );

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            livingFinancial: {
              ...livingFinancial,
              ...parseData({ familySupport: formData }),
            },
            id: assessmentId,
            caregiverId: caregiver?.id as string,
            dateCompleted: parseDateString(dateCompleted),
            patientId,
            source: "NON_OASIS",
          });
        })}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" disabled={disabled} loading={isMutating}>
              Save Changes{" "}
            </Button>
          </div>
          <div>
            <FormHeader className="mt-4">Family Supportive</FormHeader>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"familySupportive"}
                render={({ field }) => {
                  return (
                    <FormRender label="Family Supportive">
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
                name={"caregiverName"}
                render={({ field }) => (
                  <FormRender label={"Caregivers name"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"relationship"}
                render={({ field }) => (
                  <FormRender label={"Relationship"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"ableToProvide"}
                render={({ field }) => {
                  return (
                    <FormRender label="Caregiver able/willing to provide care">
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
                disabled={disabled}
                control={methods.control}
                name={"ableToReceiveInstruction"}
                render={({ field }) => {
                  return (
                    <FormRender label="Caregiver able to receive/follow instructions">
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
                disabled={disabled}
                control={methods.control}
                name={"assistWithADL"}
                render={({ field }) => {
                  return (
                    <FormRender label="Caregiver able/willing to assist with ADL's and needed care">
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
                disabled={disabled}
                control={methods.control}
                name={"assistWithlivingFacility"}
                render={({ field }) => {
                  return (
                    <FormRender label="Patient lives in Assisted Living Facility">
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
                name={"facilityName"}
                render={({ field }) => (
                  <FormRender label={"Facility Name"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"facilityPhone"}
                render={({ field }) => (
                  <FormRender label={"Phone number if different"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"comments"}
                render={({ field }) => (
                  <FormRender label={"Comments"}>
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
        <div>
          <FormHeader className="mt-4">
            Safety Hazards/Sanitation Hazards Identified in the Home
          </FormHeader>
          <div className="grid gap-5">
            <FormField
              control={methods.control}
              name={"hazardReasons"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    disabled={disabled}
                    options={[
                      {
                        value: "cluttered",
                        label: "Cluttered, unclean home environment",
                      },
                      {
                        value: "inadequate-food",
                        label: "Inadequate food storage(no refrigeration)",
                      },
                      {
                        value: "stairs-home",
                        label: "Stairs in the home patient unable to avoid",
                      },
                      {
                        value: "rodents",
                        label: "Insects/Rodents to present in the home",
                      },
                      {
                        value: "no-telephone",
                        label: "No telephone available in the home",
                      },
                      {
                        value: "residual-weakness",
                        label: "No Running water/inadequate Plumbing",
                      },
                      {
                        value: "inadequate-lighting",
                        label:
                          "Inadequate lighting or healing or cooling system",
                      },
                      {
                        value: "unsafe-gas",
                        label: "Unsafe electrical/gas system",
                      },
                      {
                        value: "no-fire-safety",
                        label:
                          "No Fire Safety in place(fire extinguisher, smoke detectors, plan for evacuation)",
                      },
                      { value: "other", label: "Other" },
                    ]}
                    name={"hazardReasons"}
                  />
                </FormRender>
              )}
            />
            {methods.watch("hazardReasons")?.includes("other") && (
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"otherHazardReasons"}
                render={({ field }) => (
                  <FormRender label={"Other"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            )}

            <div>
              <p className="text-sm font-semibold pb-2">
                If Patient using Oxygen in the Home
              </p>
              <FormField
                control={methods.control}
                name={"usingOxygen"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      disabled={disabled}
                      options={[
                        {
                          value: "no-safety-sign",
                          label: "No safety sign posted",
                        },
                        {
                          value: "oxygen-kept",
                          label:
                            "Oxygen kept less than 8 feet from open flames(gas stove, fireplace)",
                        },
                        {
                          value: "no-backup",
                          label: "No backup tank available",
                        },
                      ]}
                      name={"usingOxygen"}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" disabled={disabled} loading={isMutating}>
            Save Changes{" "}
          </Button>
        </div>{" "}
      </form>
    </Form>
  );
};

export default FamilySupportive;
