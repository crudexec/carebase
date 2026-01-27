import { DateInput, FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const Vaccine = ({
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
        name={`M1045InfluenzaVaccine`}
        render={({ field }) => (
          <FormRender label={"M1045 Influenza Vaccine"}>
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
        name={`M1045InfluenzaVaccineReceived`}
        render={({ field }) => (
          <FormRender label={"Recieved"}>
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
        name={`tetanusVaccine`}
        render={({ field }) => (
          <FormRender label={"Tetanus Vaccine"}>
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
        name={`tetanusVaccineReceived`}
        render={({ field }) => (
          <FormRender label={"Recieved"}>
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
        name={`M1055PneumococcalVaccine`}
        render={({ field }) => (
          <FormRender label={"M1055 Pneumococcal Vaccine"}>
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
        name={`M1055PneumococcalVaccineReceived`}
        render={({ field }) => (
          <FormRender label={"Recieved"}>
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
        name={`otherVaccine`}
        render={({ field }) => (
          <FormRender label={"Other Vaccine"}>
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
        name={`otherVaccineReceived`}
        render={({ field }) => (
          <FormRender label={"Recieved"}>
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

export default Vaccine;
