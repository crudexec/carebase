import React from "react";

import { DateInput, FormField, FormRender } from "@/components/ui";
import { cn } from "@/lib";
import { UserHistorySchema } from "@/schema";
import { ActionType, FormReturn } from "@/types";

type formType = FormReturn<typeof UserHistorySchema>;
const MedicalTest = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: ActionType;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end",
        "lg:grid-cols-2",
      )}
    >
      <FormField
        control={methods.control}
        name={"criminalCheckDueDate"}
        render={({ field }) => (
          <FormRender label={"Criminal Check Due Date"}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"screeningDueDate"}
        render={({ field }) => (
          <FormRender label={"Next TB Test/Screening Due Date"}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"lastCPRTraining"}
        render={({ field }) => (
          <FormRender label={"Last CPR Training"}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`CPRExpiration`}
        render={({ field }) => (
          <FormRender label={`CPR Expiration`}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`insuranceExpiration`}
        render={({ field }) => (
          <FormRender label={`Auto Insurance Expiration`}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`lastAidRegistry`}
        render={({ field }) => (
          <FormRender label={`Last Nurse AID Registry`}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"lastMisconductRegistry"}
        render={({ field }) => (
          <FormRender label={"Last Misconduct Registry"}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"greenCardExpiration"}
        render={({ field }) => (
          <FormRender label={"Green Card Expiration"}>
            <DateInput
              onChange={field.onChange}
              value={field.value as Date}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default MedicalTest;
