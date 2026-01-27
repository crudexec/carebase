import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Flex from "@/components/flex";
import FormHeader from "@/components/form-header";
import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import { HistoryAndDiagnosisForm } from "@/schema";
import {
  hospProgDefaultValues,
  HospProgForm,
  hospProgramSchema,
} from "@/schema/clinical/assessment/non-oasis/hosp-prog";

const HospitalProgram = ({
  assessmentId,
  data,
  historyAndDiagnosis,
  callback,
  caregiver,
  disabled,
  dateCompleted,
  patientId,
}: {
  assessmentId?: string;
  data: HospProgForm;
  historyAndDiagnosis: HistoryAndDiagnosisForm;
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  dateCompleted?: Date;
}) => {
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const methods = useForm<HospProgForm>({
    resolver: zodResolver(hospProgramSchema),
    defaultValues: hospProgDefaultValues,
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

  usePopulateForm<HospProgForm, HospProgForm>(methods.reset, data);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            historyAndDiagnosis: {
              ...historyAndDiagnosis,
              ...parseData({ hospData: formData }),
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
              Save Changes
            </Button>
          </div>
          <div>
            <FormHeader className="mt-4">Recent Hospitalization</FormHeader>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"recentVisit"}
                render={({ field }) => (
                  <FormRender
                    label={
                      "Recent Hospitalization stays or Emergency Room Visits"
                    }
                  >
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"visitReason"}
                render={({ field }) => (
                  <FormRender
                    label={
                      "What occurs that makes you want to or need to go to the hospital"
                    }
                  >
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">Prognosis</FormHeader>
            <div className="flex flex-col gap-5">
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"prognosis"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row justify-between flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "poor", label: "Poor" },
                          { value: "guarded", label: "Guarded" },
                          { value: "fair", label: "Fair" },
                          { value: "good", label: "Good" },
                          { value: "excellent", label: "Excellent" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">Immunizations</FormHeader>

            <div className="grid lg:grid-cols-2 gap-5">
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">Tetanus</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"tetanus"}
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
                    name={"tetanusDate"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">Pneumonia</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"pneumonia"}
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
                    name={"pneumoniaDate"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">Hepatitis</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"hepatitis"}
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
                    name={"hepatitisDate"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">Influenza</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"influenza"}
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
                    name={"influenzaDate"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">H1N1</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"h1n1"}
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
                    name={"h1n1Date"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>
              <Flex className="items-start lg:items-center justify-between flex-col lg:flex-row">
                <p className="text-sm">COVID-19</p>
                <Flex className="items-start lg:items-center gap-4 flex-col lg:flex-row">
                  <FormField
                    disabled={disabled}
                    control={methods.control}
                    name={"covid19"}
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
                    name={"covid19Date"}
                    render={({ field }) => (
                      <FormRender
                        label={"Date"}
                        formClassName="flex items-center gap-2 pl-2"
                        className="!font-normal"
                      >
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={disabled}
                          className="min-w-[240px]"
                        />
                      </FormRender>
                    )}
                  />
                </Flex>
              </Flex>

              <FormField
                disabled={disabled}
                control={methods.control}
                name={"needs"}
                render={({ field }) => (
                  <FormRender label={"Needs"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"comment"}
                render={({ field }) => (
                  <FormRender label={"Comment"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" disabled={disabled} loading={isMutating}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HospitalProgram;
