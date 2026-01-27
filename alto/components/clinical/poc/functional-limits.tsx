"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PhraseHelperText from "@/components/phrase-helper";
import {
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  RadioInput,
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

const FunctionalLimits = ({
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
        <div className="flex justify-end text-end mt-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>{" "}
        <FormHeader className="mt-4">
          Functional Limitations, Activities Permitted, Mental Status, Prognosis
        </FormHeader>
        <div className="grid grid-col-1 md:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"functionalLimitations"}
            render={({ field }) => (
              <FormRender label="Functional Limitations">
                <MultiSelect
                  options={[
                    { value: "amputations", label: "Amputations" },
                    {
                      value: "bowel-bladder",
                      label: "Bowel/Bladder (Incontinence)",
                    },
                    { value: "contracture", label: "Contracture" },
                    { value: "hearing", label: "Hearing" },
                    { value: "paralysis", label: "Paralysis" },
                    { value: "endurance", label: "Endurance" },
                    { value: "ambulation", label: "Ambulation" },
                    { value: "speech", label: "Speech" },
                    { value: "legally-blind", label: "Legally Blind" },
                    {
                      value: "dyspnea",
                      label: "Dyspnea With Minimal Exertion",
                    },
                    { value: "other", label: "Other" },
                  ]}
                  value={field.value as string[]}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Select Options"
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          {methods.watch("functionalLimitations").includes("other") && (
            <FormField
              control={methods.control}
              name={"otherFunctionalLimit"}
              render={({ field }) => (
                <FormRender label="Other Functional Limit">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          )}
          <FormField
            control={methods.control}
            name={"activitiesPermitted"}
            render={({ field }) => (
              <FormRender label="Activities Permitted">
                <MultiSelect
                  options={[
                    { value: "oriented", label: "Oriented" },
                    { value: "complete-bedrest", label: "Complete Bedrest" },
                    {
                      value: "bedrest-brp",
                      label: "Bedrest BRP (Incontinence)",
                    },
                    { value: "up-as-tolerated", label: "Up As Tolerated" },
                    {
                      value: "transfer-bed-chair",
                      label: "Transfer Bed/Chair",
                    },
                    {
                      value: "exercises-prescribed",
                      label: "Exercises Prescribed",
                    },
                    {
                      value: "partial-weight-bearing",
                      label: "Partial Weight Bearing",
                    },
                    {
                      value: "independent-at-home",
                      label: "Independent At Home",
                    },
                    { value: "crutches", label: "Crutches" },
                    { value: "cane", label: "Cane" },
                    { value: "wheelchair", label: "Wheelchair" },
                    { value: "walker", label: "Walker" },
                    { value: "no-restrictions", label: "No Restrictions" },
                    { value: "other", label: "Other" },
                  ]}
                  value={field.value as string[]}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Select Options"
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          {methods.watch("activitiesPermitted").includes("other") && (
            <FormField
              control={methods.control}
              name={"otherActivitiesPermit"}
              render={({ field }) => (
                <FormRender label="Other Activities Permitted">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          )}
          <FormField
            control={methods.control}
            name={"mentalStatus"}
            render={({ field }) => (
              <FormRender label="Mental Status">
                <MultiSelect
                  options={[
                    { value: "oriented", label: "Oriented" },
                    { value: "comatose", label: "Comatose" },
                    { value: "forgetful", label: "Forgetful" },
                    { value: "depressed", label: "Depressed" },
                    { value: "disoriented", label: "Disoriented" },
                    { value: "lethargic", label: "Lethargic" },
                    { value: "agitated", label: "Agitated" },
                    { value: "other", label: "Other" },
                  ]}
                  value={field.value as string[]}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Select Options"
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          {methods.watch("mentalStatus").includes("other") && (
            <FormField
              control={methods.control}
              name={"otherMentalStatus"}
              render={({ field }) => (
                <FormRender label="Other Mental Status">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          )}
          <div>
            <FormField
              control={methods.control}
              name={"prognosis"}
              render={({ field }) => (
                <FormRender label="Prognosis">
                  <RadioInput
                    className="gap-x-5 items-center flex-row"
                    {...field}
                    options={[
                      { value: "poor", label: "Poor" },
                      { value: "guarded", label: "Guarded" },
                      { value: "fair", label: "Fair" },
                      { value: "good", label: "Good" },
                      { value: "excellent", label: "Excellent" },
                    ]}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"cognitiveStatus"}
              render={({ field }) => (
                <FormRender label="Psychosocial and Cognitive Status">
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
                  section: "psychosocial",
                  description: methods.watch("cognitiveStatus") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "cognitiveStatus",
                    `${methods.watch("cognitiveStatus") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"rehabPotential"}
              render={({ field }) => (
                <FormRender label="Rehabilitation Potential">
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
                  section: "rehab-potential",
                  description: methods.watch("rehabPotential") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "rehabPotential",
                    `${methods.watch("rehabPotential") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"dischargePlan"}
              render={({ field }) => (
                <FormRender label="Discharge Plan(s)">
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
                  section: "discharge-plans",
                  description: methods.watch("dischargePlan") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "dischargePlan",
                    `${methods.watch("dischargePlan") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"riskIntervention"}
              render={({ field }) => (
                <FormRender label="ER/Hospital Re-Admission Risk Factors and Interventions">
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
                  section: "re-admission-factors",
                  description: methods.watch("riskIntervention") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "riskIntervention",
                    `${methods.watch("riskIntervention") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"informationRelatedTo"}
              render={({ field }) => (
                <FormRender label="Information Related to any Advanced Directives">
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
                  section: "advanced-directives",
                  description: methods.watch("informationRelatedTo") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "informationRelatedTo",
                    `${methods.watch("informationRelatedTo") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"caregiverNeeds"}
              render={({ field }) => (
                <FormRender label="Caregiver Needs">
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
                  section: "caregiver-needs",
                  description: methods.watch("caregiverNeeds") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "caregiverNeeds",
                    `${methods.watch("caregiverNeeds") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <div>
            <FormField
              control={methods.control}
              name={"homeboundStatus"}
              render={({ field }) => (
                <FormRender label="Homebound Status">
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
                  section: "homebound-status",
                  description: methods.watch("homeboundStatus") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "homeboundStatus",
                    `${methods.watch("homeboundStatus") ?? ""} ${text}`,
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
export { FunctionalLimits };
