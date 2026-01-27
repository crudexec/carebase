import React from "react";

import { DateInput, FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { UserHistorySchema } from "@/schema";
import { ActionType, FormReturn } from "@/types";

type formType = FormReturn<typeof UserHistorySchema>;

const LicenseTracking = ({
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
        name={"driversLicense.name"}
        render={({ field }) => (
          <FormRender label={"Driver's License"}>
            <Input
              {...field}
              type="number"
              value={field.value as string}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`driversLicense.expires`}
        render={({ field }) => (
          <FormRender label={`Expires`}>
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
        name={"professionalLicense.name"}
        render={({ field }) => (
          <FormRender label={"Professional License"}>
            <Input
              {...field}
              type="number"
              value={field.value as string}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={`professionalLicense.expires`}
        render={({ field }) => (
          <FormRender label={`Expires`}>
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

export default LicenseTracking;
