import { DateInput, FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema/patient/medication";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const Medicare = ({
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
        name={`medicareAEffective`}
        render={({ field }) => (
          <FormRender label={"Medicare A Effective"}>
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
        name={`medicareAEffectiveDate`}
        render={({ field }) => (
          <FormRender label={"Term Date"}>
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
        name={`medicareBEffective`}
        render={({ field }) => (
          <FormRender label={"Medicare B Effective"}>
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
        name={`medicareBEffectiveDate`}
        render={({ field }) => (
          <FormRender label={"Term Date"}>
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

export default Medicare;
