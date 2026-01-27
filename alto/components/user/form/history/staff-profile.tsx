import React from "react";

import { DateInput, FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { UserHistorySchema } from "@/schema/user/history";
import { ActionType, FormReturn } from "@/types";

type formType = FormReturn<typeof UserHistorySchema>;

const StaffProfile = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: ActionType;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 w-full",
        "lg:grid-cols-2",
      )}
    >
      <FormField
        control={methods.control}
        name={"socialSecurity"}
        render={({ field }) => (
          <FormRender label={"Social Security"}>
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
        name={`dob`}
        render={({ field }) => (
          <FormRender label={`Date of Birth`}>
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

export default StaffProfile;
