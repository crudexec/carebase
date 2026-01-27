import { MinusIcon, PlusIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import {
  Button,
  DateInput,
  FormField,
  FormRender,
  Input,
} from "@/components/ui";
import { cn } from "@/lib";
import { medicationDefaultValue, medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const CurrentMedication = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "medication",
  });

  return (
    <div
      className={cn("grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end")}
    >
      <div>
        {fields.map((item, index) => (
          <div key={item.id}>
            <div className={cn("grid lg:grid-cols-2 gap-x-7 gap-y-4")}>
              <FormField
                control={methods.control}
                name={`medication.${index}.date`}
                render={({ field }) => (
                  <FormRender label={`Date ${index + 1}`}>
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
                name={`medication.${index}.drug`}
                render={({ field }) => (
                  <FormRender label={`Drug ${index + 1}`}>
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
                name={`medication.${index}.dose`}
                render={({ field }) => (
                  <FormRender label={`Dose/Strength ${index + 1}`}>
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
                name={`medication.${index}.frequency`}
                render={({ field }) => (
                  <FormRender label={`Freq ${index + 1}`}>
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
                name={`medication.${index}.route`}
                render={({ field }) => (
                  <FormRender label={`Route ${index + 1}`}>
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
                name={`medication.${index}.NorC`}
                render={({ field }) => (
                  <FormRender label={`(N) or (C) ${index + 1}`}>
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
                name={`medication.${index}.sideEffect`}
                render={({ field }) => (
                  <FormRender label={`Side Effect ${index + 1}`}>
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
                name={`medication.${index}.medClassification`}
                render={({ field }) => (
                  <FormRender label={`Med Classification ${index + 1}`}>
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
                name={`medication.${index}.dcDate`}
                render={({ field }) => (
                  <FormRender label={`D/C Date ${index + 1}`}>
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
                name={`medication.${index}.signature`}
                render={({ field }) => (
                  <FormRender label={`Signature ${index + 1}`}>
                    <Input
                      {...field}
                      disabled={mode === "view"}
                      value={field.value as string}
                    />
                  </FormRender>
                )}
              />
            </div>
            {mode !== "view" && (
              <div className={cn("flex space-x-3 items-center mt-2")}>
                {index === fields.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => append(medicationDefaultValue.medication[0])}
                  >
                    <PlusIcon className="size-4" />
                    Add More
                  </Button>
                )}
                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentMedication;
