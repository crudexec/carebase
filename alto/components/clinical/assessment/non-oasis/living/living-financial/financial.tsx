import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect } from "react";
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
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import {
  financialDefaultValues,
  FinancialForm,
  financialSchema,
} from "@/schema/clinical/assessment/non-oasis/living/living-financial/financial";

const FinancialTab = ({
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
  data: FinancialForm;
  livingFinancial: object;
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  dateCompleted?: Date;
}) => {
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const methods = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
    defaultValues: financialDefaultValues,
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

  usePopulateForm<FinancialForm, FinancialForm>(methods.reset, data);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            livingFinancial: {
              ...livingFinancial,
              ...parseData({ financial: formData }),
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
          <FormHeader className="mt-4">Financial</FormHeader>
          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <p className="text-sm font-semibold pb-5">
                Ability of Patient to handle personal finance
              </p>
              <FormField
                control={methods.control}
                name={"personalFinance"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      disabled={disabled}
                      options={[
                        { value: "independent", label: "independent" },
                        {
                          value: "needs assistance",
                          label: "Needs Assistance",
                        },
                        {
                          value: "totally dependent",
                          label: "Totally Dependent",
                        },
                      ]}
                      name={"personalFinance"}
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"medicalExpenses"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Medical expenses not covered by insurance/Medicare
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"inadequateIncome"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Inadequate to buy necessities(food, meds,supplies,etc)
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"inappropriateUseIncome"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Inappropriate use of limited income(alcohol, illegal
                      drugs, etc)
                    </span>
                  </div>
                </FormRender>
              )}
            />

            <FormField
              disabled={disabled}
              control={methods.control}
              name={"comments"}
              render={({ field }) => (
                <FormRender label={"Comments"} formClassName="lg:col-span-2">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader>Community agencies/social services screening</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              disabled={disabled}
              control={methods.control}
              name={"communityResource"}
              render={({ field }) => {
                return (
                  <FormRender label="Community resource info needed to manage care">
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
              name={"suspectedNeglect"}
              render={({ field }) => {
                return (
                  <FormRender label="Suspected Neglect">
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
              name={"alteredAffect"}
              render={({ field }) => {
                return (
                  <FormRender label="Altered affect(depression, grid)">
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
              name={"leftUnattended"}
              render={({ field }) => {
                return (
                  <FormRender label="Left unattended if needs constant supervision">
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
              name={"suicidalIdeation"}
              render={({ field }) => {
                return (
                  <FormRender label="Suicidal Ideation">
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
              name={"inadequateMethod"}
              render={({ field }) => {
                return (
                  <FormRender label="Inadequate method to cook or shop for groceries">
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
              name={"suspectedPhysicalAbuse"}
              render={({ field }) => {
                return (
                  <FormRender label="Suspected Physical Abuse">
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
              name={"insect"}
              render={({ field }) => {
                return (
                  <FormRender label="Insect/Rodent Present">
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
              name={"suspectedFinancialAbuse"}
              render={({ field }) => {
                return (
                  <FormRender label="Suspected Financial Abuse">
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
              name={"mswReferral"}
              render={({ field }) => {
                return (
                  <FormRender label="MSW referral made">
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
              name={"agencyComments"}
              render={({ field }) => (
                <FormRender label={"Comments"} formClassName="lg:col-span-2">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
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

export default FinancialTab;
