"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSavePlanOfCare } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

const Main = ({
  caregiver,
  patientId,
  callback,
  data,
  disabled,
  isCert485,
}: {
  patientId: string;
  callback: (planOfCare?: string) => void;
  caregiver?: User;
  data: PlanOfCareResponse;
  disabled?: boolean;
  isCert485?: boolean;
}) => {
  const methods = useForm<PlanOfCareForm>({
    resolver: zodResolver(planOfCareSchema),
    defaultValues: planOfCareDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSavePlanOfCare();

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const planOfCare = useMemo(() => {
    return modifyDateFields({ ...data } as PlanOfCareResponse);
  }, [data]);

  usePopulateForm<PlanOfCareForm, PlanOfCareResponse>(
    methods.reset,
    planOfCare,
  );

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            caregiverId: caregiver?.id,
            patientId,
            isCert485,
          });
        })}
      >
        <div>
          <FormHeader className="mt-4">Certification Period</FormHeader>
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"certStartDate"}
              render={({ field }) => (
                <FormRender label={"Cert From"}>
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"certEndDate"}
              render={({ field }) => (
                <FormRender label={"Cert To"}>
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader className="mt-4">Physician Signature Tracking</FormHeader>
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"signatureSentDate"}
              render={({ field }) => (
                <FormRender label={"Date Sent to Physician"}>
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
              name={"signatureReceivedDate"}
              render={({ field }) => (
                <FormRender label="Sent Via">
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
        </div>
        <div className="mt-4">
          <FormHeader className="mt-4">
            Notes (For internal use only, this will not be printed on POC)
          </FormHeader>
          <FormField
            control={methods.control}
            name={"mainInternalNote"}
            render={({ field }) => (
              <FormRender>
                <Textarea
                  {...field}
                  value={field.value as string}
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
        </div>
      </form>
    </Form>
  );
};

export { Main };
