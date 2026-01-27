"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PhraseHelperText from "@/components/phrase-helper";
import { Button, Form, FormField, FormRender, Textarea } from "@/components/ui";
import { usePopulateForm, useSavePlanOfCare } from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

const Cert485Orders = ({
  caregiver,
  patientId,
  callback,
  data,
  disabled,
}: {
  patientId: string;
  callback: (planOfCare?: string) => void;
  caregiver?: User;
  data: PlanOfCareResponse;
  disabled?: boolean;
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
            isCert485: true,
          });
        })}
      >
        <div>
          <FormHeader className="mt-4">
            Orders for Discipline and Treatments (Specify
            Amount/Frequency/Duration)
          </FormHeader>
          <FormField
            control={methods.control}
            name={"cert485Orders"}
            render={({ field }) => (
              <FormRender>
                <Textarea
                  {...field}
                  value={field.value as string}
                  disabled={disabled}
                  rows={20}
                />
              </FormRender>
            )}
          />
          {!disabled && (
            <PhraseHelperText
              formData={{
                section: "orders",
                description: methods.watch("cert485Orders") ?? "",
              }}
              callback={(text) => {
                methods.setValue(
                  "cert485Orders",
                  `${methods.watch("cert485Orders") ?? ""} ${text}`,
                );
              }}
            />
          )}
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

export { Cert485Orders };
