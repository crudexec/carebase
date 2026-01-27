"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import { Button, Form, FormField, FormRender, Textarea } from "@/components/ui";
import { usePopulateForm, useSavePlanOfCare } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

const Medication = ({
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
      toast.success("Medication saved successfully!");
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
          <FormHeader className="mt-4">Medications</FormHeader>
          <div className="grid grid-cols-6 bg-secondary mb-2 px-2 font-semibold">
            <p>Medication</p>
            <p>Dose</p>
            <p>Freq</p>
            <p>Route</p>
            <p>New/Chg</p>
            <p>Comments</p>
          </div>
          <FormField
            control={methods.control}
            name={"medication"}
            render={({ field }) => (
              <FormRender>
                <Textarea
                  {...field}
                  value={field.value as string}
                  disabled={disabled}
                  rows={20}
                  placeholder="Medication - dose - freq - route-new/chg - comments"
                />
              </FormRender>
            )}
          />
        </div>

        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { Medication };
