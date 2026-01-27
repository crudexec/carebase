import { FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const ContactInformation = ({
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
        name={`primaryCaregiver`}
        render={({ field }) => (
          <FormRender label={"Primary Caregiver"}>
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
        name={`physicianOrders`}
        render={({ field }) => (
          <FormRender label={"Physician Orders"}>
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
        name={`emergencyContact`}
        render={({ field }) => (
          <FormRender label={"Emergency Contact"}>
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
        name={`contactNumber`}
        render={({ field }) => (
          <FormRender label={"Contact Number"}>
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

export default ContactInformation;
