import {
  FormField,
  FormRender,
  MultiSelect,
  SelectInput,
} from "@/components/ui";
import { functionLimitsOption, rueOptions } from "@/constants";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const FunctionalLimits = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
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
        name={"functionLimits"}
        render={({ field }) => (
          <FormRender label="Functional Units">
            <MultiSelect
              options={functionLimitsOption}
              value={field.value as string[]}
              onChange={(value) => {
                field.onChange(value);
              }}
              placeholder="Select Functional Units(s)"
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />
      <FormField
        control={methods.control}
        name={"rue"}
        render={({ field }) => (
          <FormRender label={"Rue"}>
            <SelectInput
              options={rueOptions}
              field={field}
              disabled={mode === "view"}
              placeholder="Select one option"
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default FunctionalLimits;
