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

const PlanOfCareDME = ({
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
        <FormHeader className="mt-4">
          DME Supplies, Safety Measures, Nutritional Req., Allergies
        </FormHeader>
        <div className="grid grid-col-1 md:grid-cols-2 gap-5">
          <div>
            <FormField
              control={methods.control}
              name={"dmeSupplies"}
              render={({ field }) => (
                <FormRender label="DME Supplies">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "dme-sup",
                  description: methods.watch("dmeSupplies") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "dmeSupplies",
                    `${methods.watch("dmeSupplies") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"safetyMeasures"}
              render={({ field }) => (
                <FormRender label="Safety Measures">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "safety",
                  description: methods.watch("safetyMeasures") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "safetyMeasures",
                    `${methods.watch("safetyMeasures") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"nutritionalRequirement"}
              render={({ field }) => (
                <FormRender label="Nutritional Req.">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "nutritional-req",
                  description: methods.watch("nutritionalRequirement") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "nutritionalRequirement",
                    `${methods.watch("nutritionalRequirement") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"allergies"}
              render={({ field }) => (
                <FormRender label="Allergies">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "allergies",
                  description: methods.watch("allergies") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "allergies",
                    `${methods.watch("allergies") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
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
export { PlanOfCareDME };
