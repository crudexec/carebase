import { FormField, FormRender, Input } from "@/components/ui";
import { cn } from "@/lib";
import { medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const PriorEpisode = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  return (
    <div className={cn("grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 w-full")}>
      <FormField
        control={methods.control}
        name={`admissionsourceCodeC`}
        render={({ field }) => (
          <FormRender
            label={
              'Patient within theiir sixty (60) day period on OUR services, Admission Source Code should be "C"'
            }
          >
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
        name={`admissionSourceCodeB`}
        render={({ field }) => (
          <FormRender
            label={
              'Patient on services with ANOTHER agency. Complete Beneficiary Transfer Statement. Admission Source Code should be "B"'
            }
          >
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

export default PriorEpisode;
