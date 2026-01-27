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
  CheckOneBox,
  DateInput,
  DateTimeInput,
  Form,
  FormField,
  FormRender,
  SelectInput,
} from "@/components/ui";
import { useGetUsers, usePopulateForm, useSaveAssessment } from "@/hooks";
import { modifyDateFields, parseData, parseDateString } from "@/lib";
import {
  oasisAssesmentDefaultValue,
  OasisAssessmentForm,
  oasisAssessmentSchema,
} from "@/schema";

const Reason = ({
  caregiver,
  patientId,
  callback,
  data,
  disabled,
  dateCompleted,
  reasons,
  assessmentId,
}: {
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  data: OasisAssessmentForm;
  disabled?: boolean;
  dateCompleted?: Date;
  reasons?: string[];
  assessmentId?: string;
}) => {
  const methods = useForm<OasisAssessmentForm>({
    resolver: zodResolver(oasisAssessmentSchema),
    defaultValues: oasisAssesmentDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const { data: caregivers, isLoading } = useGetUsers({ tab: "nurse" });

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const oasisAssessment = useMemo(() => {
    return modifyDateFields({ ...data, reasons } as OasisAssessmentForm & {
      reasons: [string, ...string[]];
    });
  }, [data, reasons]);

  usePopulateForm<
    OasisAssessmentForm,
    OasisAssessmentForm & { reasons: [string, ...string[]] }
  >(methods.reset, oasisAssessment);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async ({ reasons, ...formData }) => {
          await trigger({
            oasisAssessment: parseData(formData),
            id: assessmentId,
            caregiverId: caregiver?.id,
            dateCompleted: parseDateString(dateCompleted),
            patientId,
            source: "OASIS",
            reasons,
          });
        })}
      >
        <div className="flex justify-end text-end mt-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>{" "}
        <div className="grid grid-col-1 md:grid-cols-2 gap-5">
          <div>
            <FormHeader className="mt-4">Visit Times</FormHeader>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"timeIn"}
                render={({ field }) => (
                  <FormRender label={"Time In"}>
                    <DateTimeInput
                      {...field}
                      value={field.value as Date}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"timeOut"}
                render={({ field }) => (
                  <FormRender label={"Time Out"}>
                    <DateTimeInput
                      {...field}
                      value={field.value as Date}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
            <FormHeader className="mt-4">
              (M0080) Discipline of person completing Assessment
            </FormHeader>
            <Flex col gap={4}>
              <FormField
                control={methods.control}
                name={"discipline"}
                render={({ field }) => (
                  <FormRender formClassName="flex gap-4" type="checkbox">
                    <CheckOneBox
                      methods={methods}
                      {...field}
                      options={[
                        { value: "rn", label: "RN" },
                        { value: "pt", label: "PT" },
                        { value: "slp-st", label: "SLP/ST" },
                        { value: "ot", label: "OT" },
                      ]}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
              <div>
                <p className="text-sm font-semibold mb-2">
                  (M0090) Date Assessment Completed:{" "}
                </p>
                <DateInput
                  onChange={() => null}
                  value={parseDateString(dateCompleted) as Date}
                  disabled={true}
                />
              </div>
            </Flex>
            <FormHeader className="mt-4">
              (M0100) This assessment is completed for the following reason:
            </FormHeader>
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
                        checked={methods.watch("reasons")?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const reasons = methods.watch("reasons");
                          const newReasons = reasons.filter(
                            (value) => !["1", "2"].includes(value),
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
                label="Follow-Up"
                type="checkbox"
              >
                <Flex col gap={4}>
                  {[
                    {
                      value: "3",
                      label: "Recertification (follow-up) reassessment",
                    },
                    { value: "4", label: "Other Follow-Up" },
                  ].map((item) => (
                    <Flex key={item.value}>
                      <Checkbox
                        checked={methods.watch("reasons")?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const reasons = methods.watch("reasons");
                          const newReasons = reasons.filter(
                            (value) => !["3", "4"].includes(value),
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
                label="Transfer to an in-patient facility"
                type="checkbox"
              >
                <Flex col gap={4}>
                  {[
                    { value: "5", label: "Patient not discharged from agency" },
                    { value: "6", label: "Patient discharged from agency" },
                  ].map((item) => (
                    <Flex key={item.value}>
                      <Checkbox
                        checked={methods.watch("reasons")?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const reasons = methods.watch("reasons");
                          const newReasons = reasons.filter(
                            (value) => !["5", "6"].includes(value),
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
                  {[
                    { value: "7", label: "Death at Home" },
                    { value: "8", label: "Discharge from agency" },
                  ].map((item) => (
                    <Flex key={item.value}>
                      <Checkbox
                        checked={methods.watch("reasons")?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const reasons = methods.watch("reasons");
                          const newReasons = reasons.filter(
                            (value) => !["7", "8"].includes(value),
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
            {methods?.formState?.errors?.reasons && (
              <p className="text-red-500 text-xs">
                {methods?.formState?.errors?.reasons?.message ?? ""}
              </p>
            )}
          </div>
          <div>
            {["5", "6", "7", "8"].some((reason) =>
              methods.watch("reasons")?.includes(reason),
            ) && (
              <div>
                <FormHeader className="mt-4">
                  M0906 - Discharge/Transfer/Death Date
                </FormHeader>
                <FormField
                  control={methods.control}
                  name={"dischargeTransferOrDeathDate"}
                  render={({ field }) => (
                    <FormRender
                      label={
                        "Enter the date of the discharge, transfer, or death (at home) of the patient."
                      }
                    >
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
            )}
            {(!methods.watch("reasons").length ||
              ["1", "2"].some((reason) =>
                methods.watch("reasons")?.includes(reason),
              )) && (
              <div>
                <FormHeader className="mt-4">
                  (M0102) Physician-ordered SOC/ROC date
                </FormHeader>
                <p className="text-sm mb-2">
                  If the physician indicated a specific start of care
                  (resumption of care) date when the patient was referred for
                  home health service.
                </p>
                <Flex className="!items-center gap-4">
                  <FormField
                    control={methods.control}
                    name={"startOfCareDate"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date of physician-ordered start of care"}
                      >
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
                    name={"noSOCDate"}
                    render={({ field }) => (
                      <FormRender formClassName="mt-4">
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                          <span className="text-sm">
                            No specific SOC date order by physician
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                </Flex>
              </div>
            )}
            <FormHeader className="mt-4">(M0104) Date of referral</FormHeader>
            <FormField
              control={methods.control}
              name={"referralDate"}
              render={({ field }) => (
                <FormRender
                  label={
                    "Indicate the date that the written or verbal referral for initiation or resumption of care was received by HHA"
                  }
                >
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={disabled || !methods.watch("noSOCDate")}
                  />
                </FormRender>
              )}
            />

            <FormHeader className="mt-4">(M0110) Episode Timing</FormHeader>
            <p className="text-sm mb-2">
              Is the Medicare Home Health payment episode for which this
              assessment will define a case mix group an "early" episode or
              "later" episode in the patient's current sequence of adjacent
              Medicare home health payment episodes?{" "}
            </p>
            <Flex col gap={2} className="w-full">
              <FormField
                control={methods.control}
                name={"episodeTiming"}
                render={({ field }) => (
                  <FormRender
                    formClassName="flex flex-col gap-4"
                    label="Transfer to an in-patient facility"
                    type="checkbox"
                  >
                    <CheckOneBox
                      methods={methods}
                      {...field}
                      options={[
                        { value: "early", label: "Early" },
                        { value: "later", label: "Later" },
                        { value: "unknown", label: "Unknown" },
                        {
                          value: "NA",
                          label:
                            "No Medicare case mix group defined by this assessment",
                        },
                      ]}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </Flex>

            <Flex col className="mt-4">
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

              <FormField
                control={methods.control}
                name={"isComprehensive"}
                render={({ field }) => (
                  <FormRender formClassName="mt-4">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={
                          ["5", "6", "7"].some((reason) =>
                            methods.watch("reasons")?.includes(reason),
                          ) ||
                          !methods?.watch("reasons")?.length ||
                          disabled
                        }
                      />
                      <span className="text-sm">Comprehensive Assessment</span>
                    </div>
                  </FormRender>
                )}
              />
            </Flex>
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { Reason };
