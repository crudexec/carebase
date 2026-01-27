import {
  DateInput,
  FormField,
  FormRender,
  Input,
  SelectInput,
} from "@/components/ui";
import { foleyCatheterOptions } from "@/constants";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const FoleyCatheter = ({
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
        name={`foleyCatheter`}
        render={({ field }) => (
          <FormRender label={"Foley Catheter"}>
            <SelectInput
              options={foleyCatheterOptions}
              field={field}
              disabled={mode === "view"}
              placeholder="Select one option"
            />
          </FormRender>
        )}
      />

      {methods.watch("foleyCatheter") === "YES" && (
        <FormField
          control={methods.control}
          name={`foleyCatheterDate`}
          render={({ field }) => (
            <FormRender label={"If No, Date Inserted"}>
              <DateInput
                onChange={field.onChange}
                value={field.value as Date}
                disabled={mode === "view"}
              />
            </FormRender>
          )}
        />
      )}

      <FormField
        control={methods.control}
        name={`foleyCatheterSize`}
        render={({ field }) => (
          <FormRender label={"Size"}>
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
        name={`foleyCatheterFrequency`}
        render={({ field }) => (
          <FormRender label={"Frequency"}>
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
        name={`foleyCatheterLabWork`}
        render={({ field }) => (
          <FormRender label={"Lab Work"}>
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

export default FoleyCatheter;
