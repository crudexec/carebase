import { MinusIcon, PlusIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import {
  Button,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { serviceReqestedOptions, serviceReqestedOptions2 } from "@/constants";
import { cn } from "@/lib";
import { medicationDefaultValue, medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const ServicesRequested = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "serviceRequested",
  });

  return (
    <div className={cn("grid grid-cols-1 gap-y-4 w-full")}>
      {fields.map((item, index) => (
        <div key={item.id} className="md:px-8 px-4 ">
          <div
            className={cn(
              "grid grid-cols-1 gap-x-7 gap-y-4 w-full",
              "lg:grid-cols-3",
            )}
          >
            <FormField
              control={methods.control}
              name={`serviceRequested.${index}.service`}
              render={({ field }) => (
                <FormRender label={`Services Requested ${index + 1}`}>
                  <SelectInput
                    options={serviceReqestedOptions}
                    field={field}
                    disabled={mode === "view"}
                    placeholder="Select one option"
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={`serviceRequested.${index}.discipline`}
              render={({ field }) => (
                <FormRender label={`Discipline ${index + 1}`}>
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
              name={`serviceRequested.${index}.frequency`}
              render={({ field }) => (
                <FormRender label={`Frequency ${index + 1}`}>
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
            <div className={cn("flex space-x-3 items-center my-2")}>
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

      <div
        className={cn(
          "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 w-full",
          "lg:grid-cols-3",
        )}
      >
        <FormField
          control={methods.control}
          name={`serviceRequestedMedication`}
          render={({ field }) => (
            <FormRender label={`Medication`}>
              <SelectInput
                options={serviceReqestedOptions2}
                field={field}
                disabled={mode === "view"}
                placeholder="Select one option"
              />
            </FormRender>
          )}
        />

        <FormField
          control={methods.control}
          name={`auxiliaryService`}
          render={({ field }) => (
            <FormRender label={"Auxilliary Service"}>
              <div className="flex items-center gap-4 text-sm">
                <SelectInput
                  options={[
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" },
                  ]}
                  field={field}
                  disabled={mode === "view"}
                  placeholder="Select one option"
                />
              </div>
            </FormRender>
          )}
        />

        <FormField
          control={methods.control}
          name={"serviceRequestedComments"}
          render={({ field }) => (
            <FormRender label={"Comments"}>
              <Textarea
                {...field}
                disabled={mode === "view"}
                value={field.value as string}
              />
            </FormRender>
          )}
        />
      </div>
    </div>
  );
};

export default ServicesRequested;
