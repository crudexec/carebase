import { FormField, FormRender, Input, SelectInput } from "@/components/ui";
import { stageTypeOptions } from "@/constants";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const UlcerHistory = ({
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
        name={"pressureUlcer"}
        render={({ field }) => (
          <FormRender label={"Pressure Ulcer"}>
            <SelectInput
              options={stageTypeOptions}
              field={field}
              disabled={mode === "view"}
              placeholder="Select one option"
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"ulcerComments"}
        render={({ field }) => (
          <FormRender label={"Comments"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default UlcerHistory;
