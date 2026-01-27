"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Flex from "@/components/flex";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
} from "@/components/ui";
import { useGetUsers, usePopulateForm, useSaveAssessment } from "@/hooks";
import { modifyDateFields, parseData, parseDateString } from "@/lib";
import {
  patientTrackingDefaultValues,
  PatientTrackingForm,
  patientTrackingSchema,
} from "@/schema/clinical/assessment/non-oasis/patient-tracking";

const PatientTracking = ({
  data,
  reasons,
  callback,
  caregiver,
  disabled,
  dateCompleted,
  patientId,
  assessmentId,
}: {
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  data: PatientTrackingForm;
  disabled?: boolean;
  dateCompleted?: Date;
  reasons?: string[];
  assessmentId?: string;
}) => {
  const methods = useForm<PatientTrackingForm>({
    resolver: zodResolver(patientTrackingSchema),
    defaultValues: patientTrackingDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data: response, trigger, isMutating } = useSaveAssessment();
  const { data: caregivers, isLoading } = useGetUsers({ tab: "nurse" });

  const patientTracking = useMemo(() => {
    return modifyDateFields({ ...data, reasons } as PatientTrackingForm & {
      reasons: [string, ...string[]];
    });
  }, [data, reasons]);

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  usePopulateForm(methods.reset, patientTracking);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async ({ reasons, ...formData }) => {
          await trigger({
            patientTracking: parseData(formData),
            reasons,
            id: assessmentId,
            caregiverId: caregiver?.id,
            dateCompleted: parseDateString(dateCompleted),
            patientId,
            source: "NON_OASIS",
          });
        })}
      >
        <div className="flex justify-end text-end mt-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
        <div className="grid grid-col-1 md:grid-cols-2 gap-5">
          <div>
            <FormHeader className="mt-4">Patient Tracking</FormHeader>
            <div>
              <p className="font-semibold text-sm py-5">
                Office(agency) related information
              </p>

              <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"certificationNUmber"}
                  render={({ field }) => (
                    <FormRender label={"CMS Certification Number"}>
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
                  name={"branchId"}
                  render={({ field }) => (
                    <FormRender label={"Branch ID Number"}>
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
                  name={"branchState"}
                  render={({ field }) => (
                    <FormRender label={"Branch State"}>
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
                  name={"npi"}
                  render={({ field }) => (
                    <FormRender label={"National Provider ID (NPI)"}>
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
              <p className="font-semibold text-sm py-5">
                Admission Related Information
              </p>
              <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"patientNumber"}
                  render={({ field }) => (
                    <FormRender label={"Patient ID Number"}>
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
                  name={"startDate"}
                  render={({ field }) => (
                    <FormRender label={"Start of Care Date"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"resumptionDate"}
                  render={({ field }) => (
                    <FormRender label={"Resumption Care Date"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <Flex className="justify-between items-center pt-4">
                <p className="text-sm text-primary">
                  Change Admission Information
                </p>
                <FormField
                  control={methods.control}
                  name={"changeAdmissionInfo"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">NA - no applicable</span>
                      </div>
                    </FormRender>
                  )}
                />
              </Flex>
            </div>

            <div>
              <p className="font-semibold text-sm py-5">
                Patient demographics related information
              </p>
              <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"firstName"}
                  render={({ field }) => (
                    <FormRender label={"First Name"}>
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
                  name={"mi"}
                  render={({ field }) => (
                    <FormRender label={"MI"}>
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
                  name={"suffix"}
                  render={({ field }) => (
                    <FormRender label={"Suffix"}>
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
                  name={"state"}
                  render={({ field }) => (
                    <FormRender label={"Patient State of Residence"}>
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
                  name={"zip"}
                  render={({ field }) => (
                    <FormRender label={"Patient Zip Code"}>
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
                  name={"medicareNumber"}
                  render={({ field }) => (
                    <FormRender label={"Medicare Number"}>
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
                  name={"ssn"}
                  render={({ field }) => (
                    <FormRender label={"Social Security Number"}>
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
                  name={"medicaidNumber"}
                  render={({ field }) => (
                    <FormRender label={"Medicaid Number"}>
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
                  name={"birthDate"}
                  render={({ field }) => (
                    <FormRender label={"Birth Date"}>
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"gender"}
                  render={({ field }) => (
                    <FormRender label={"Gender"}>
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
                  name={"noMedicare"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">NA - no medicare</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"unknown"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">UK - unkonwn/NA</span>
                      </div>
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"noMedicaid"}
                  render={({ field }) => (
                    <FormRender formClassName="mt-4">
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">NA - no medicaid</span>
                      </div>
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>
          <div>
            <div>
              <FormHeader className="mt-4">Clinical Record Items</FormHeader>
              <div className="w-full">
                <FormField
                  control={methods.control}
                  name={"dateCompleted"}
                  render={({ field }) => (
                    <FormRender label={"Date Assessment Completed"}>
                      <DateInput
                        {...field}
                        onChange={() => null}
                        value={parseDateString(dateCompleted) as Date}
                        disabled={true}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <FormHeader className="mt-4">
              This Assessment is Currently Being Completed for the Following
              Reason:
            </FormHeader>
            <Flex className="flex-col gap-4 items-start">
              <Flex col gap={6}>
                <FormRender
                  formClassName="flex flex-col gap-4"
                  label="Start/resumption of Care"
                  type="checkbox"
                >
                  <Flex col gap={4}>
                    {[
                      {
                        value: "1",
                        label: " Start of care, further visits planned",
                      },
                      {
                        value: "2",
                        label: "Resumption of care (after in-patient stay)",
                      },
                    ].map((item) => (
                      <Flex key={item.value}>
                        <Checkbox
                          checked={methods
                            .watch("reasons")
                            ?.includes(item.value)}
                          onCheckedChange={(checked) => {
                            const reasons = methods.watch("reasons");
                            const newReasons = reasons.filter(
                              (value: string) => !["1", "2"].includes(value),
                            );
                            const value = (
                              checked
                                ? [...newReasons, item.value]?.sort()
                                : [...newReasons]
                            ) as [string, ...string[]];
                            methods.setValue("reasons", value);
                          }}
                          disabled={disabled}
                        />
                        <p className="text-sm font-normal !my-0 !space-y-0">
                          {item.label}
                        </p>
                      </Flex>
                    ))}
                  </Flex>
                </FormRender>
              </Flex>

              <FormRender
                formClassName="flex flex-col gap-4"
                label="Follow-Up"
                type="checkbox"
              >
                <Flex col gap={4}>
                  {[
                    {
                      value: "3",
                      label: "Recertification (follow-up) reassessment",
                    },
                  ].map((item) => (
                    <Flex key={item.value}>
                      <Checkbox
                        checked={methods.watch("reasons")?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const reasons = methods.watch("reasons");
                          const newReasons = reasons.filter(
                            (value: string) => !["3"].includes(value),
                          );
                          const value = (
                            checked
                              ? [...newReasons, item.value]?.sort()
                              : [...newReasons]
                          ) as [string, ...string[]];
                          methods.setValue("reasons", value);
                        }}
                        disabled={disabled}
                      />
                      <p className="text-sm font-normal !my-0 !space-y-0">
                        {item.label}
                      </p>
                    </Flex>
                  ))}
                </Flex>
              </FormRender>

              <FormRender
                formClassName="flex flex-col gap-4"
                label="Discharge from Agency - Not to an in-patient facility"
                type="checkbox"
              >
                <Flex col gap={4}>
                  {[{ value: "8", label: "Discharged from agency" }].map(
                    (item) => (
                      <Flex key={item.value}>
                        <Checkbox
                          checked={methods
                            .watch("reasons")
                            ?.includes(item.value)}
                          onCheckedChange={(checked) => {
                            const reasons = methods.watch("reasons");
                            const newReasons = reasons.filter(
                              (value: string) => !["8"].includes(value),
                            );
                            const value = (
                              checked
                                ? [...newReasons, item.value]?.sort()
                                : [...newReasons]
                            ) as [string, ...string[]];
                            methods.setValue("reasons", value);
                          }}
                          disabled={disabled}
                        />
                        <p className="text-sm font-normal !my-0 !space-y-0">
                          {item.label}
                        </p>
                      </Flex>
                    ),
                  )}
                </Flex>
              </FormRender>
              {methods?.formState?.errors?.reasons && (
                <p className="text-red-500 text-xs">
                  {methods?.formState?.errors?.reasons?.message ?? ""}
                </p>
              )}
              <div className="w-full">
                <FormField
                  control={methods.control}
                  name={"nurseId"}
                  render={({ field }) => (
                    <FormRender label={"Nurse"} formClassName="w-full">
                      <SelectInput
                        options={
                          caregivers?.data?.users?.map((caregiver) => ({
                            label: `${caregiver.firstName} ${caregiver.lastName}`,
                            value: caregiver.id,
                          })) || []
                        }
                        field={field}
                        loading={isLoading}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </Flex>
          </div>
        </div>
        <div className="flex justify-end text-end mt-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { PatientTracking };
