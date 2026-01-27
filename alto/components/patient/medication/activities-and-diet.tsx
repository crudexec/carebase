import {
  FormField,
  FormRender,
  Input,
  MultiSelect,
  SelectInput,
} from "@/components/ui";
import {
  activitiesAndDietOptions,
  assistiveDeviceOptions,
  wtBearingOptions,
} from "@/constants";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const ActivitiesAndDiet = ({
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
        name={`activitiesAndDiet`}
        render={({ field }) => (
          <FormRender label="Activities And Diet">
            <MultiSelect
              options={activitiesAndDietOptions}
              value={field.value as string[]}
              onChange={(value) => {
                field.onChange(value);
              }}
              placeholder="Select Activities And Diet"
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"wtBearing"}
        render={({ field }) => (
          <FormRender label={"WT Bearing"}>
            <SelectInput
              options={wtBearingOptions}
              field={field}
              disabled={mode === "view"}
              placeholder="Select WT Bearing"
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"assistiveDevice"}
        render={({ field }) => (
          <FormRender label={"Assistive Device"}>
            <SelectInput
              options={assistiveDeviceOptions}
              field={field}
              disabled={mode === "view"}
              placeholder="Select Assistive Device"
            />
          </FormRender>
        )}
      />
      <FormField
        control={methods.control}
        name={"diet"}
        render={({ field }) => (
          <FormRender label={"Diet"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"allergies"}
        render={({ field }) => (
          <FormRender label={"Allergies"}>
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

export default ActivitiesAndDiet;
