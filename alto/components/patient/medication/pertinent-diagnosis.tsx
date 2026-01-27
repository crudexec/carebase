import { MinusIcon, PlusIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";

import {
  Button,
  DateInput,
  FormField,
  FormRender,
  Input,
  SelectInput,
} from "@/components/ui";
import { dateTypeOptions } from "@/constants";
import { cn } from "@/lib";
import { medicationDefaultValue, medicationFormSchema } from "@/schema";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof medicationFormSchema>;
const PertinentDiagnosis = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "otherDx",
  });
  const {
    fields: fields2,
    append: append2,
    remove: remove2,
  } = useFieldArray({
    control: methods?.control,
    name: "MIO12InpatientProcedure",
  });

  return (
    <div
      className={cn("grid grid-cols-1 gap-y-4 md:px-8 px-4 items-end w-full")}
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-x-7 gap-y-4  w-full",
          "lg:grid-cols-2",
        )}
      >
        <FormField
          control={methods.control}
          name={`primaryDx.name`}
          render={({ field }) => (
            <FormRender label={"Primary DX"}>
              <Input
                {...field}
                disabled={mode === "view"}
                value={field.value as string}
              />
            </FormRender>
          )}
        />
        <div className="flex gap-2">
          <FormField
            control={methods.control}
            name={`primaryDx.dateType`}
            render={({ field }) => (
              <FormRender label={"Date"}>
                <SelectInput
                  options={dateTypeOptions}
                  field={field}
                  disabled={mode === "view"}
                  placeholder=""
                />
              </FormRender>
            )}
          />
          <div className="flex-1">
            <FormField
              control={methods.control}
              name={`primaryDx.date`}
              render={({ field }) => (
                <FormRender label={<div className="mt-6" />}>
                  <DateInput
                    onChange={field.onChange}
                    value={field.value as Date}
                    disabled={mode === "view"}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 gap-x-7 gap-y-4")}>
        {fields.map((item, index) => (
          <div key={item.id}>
            <div
              className={cn(
                "grid grid-cols-1 gap-x-7 gap-y-4  w-full",
                "lg:grid-cols-2",
              )}
            >
              <FormField
                control={methods.control}
                name={`otherDx.${index}.name`}
                render={({ field }) => (
                  <FormRender label={`Other DX ${index + 1}`}>
                    <Input
                      {...field}
                      disabled={mode === "view"}
                      value={field.value as string}
                      className="flex-1"
                    />
                  </FormRender>
                )}
              />
              <div className="flex gap-2 mt-1">
                <FormField
                  control={methods.control}
                  name={`otherDx.${index}.dateType`}
                  render={({ field }) => (
                    <FormRender label={`Date ${index + 1}`}>
                      <SelectInput
                        options={dateTypeOptions}
                        field={field}
                        disabled={mode === "view"}
                        placeholder=""
                      />
                    </FormRender>
                  )}
                />
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={`otherDx.${index}.date`}
                    render={({ field }) => (
                      <FormRender label={<div className="mt-6" />}>
                        <DateInput
                          onChange={field.onChange}
                          value={field.value as Date}
                          disabled={mode === "view"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            {mode !== "view" && (
              <div className={cn("flex space-x-3 items-center  mt-2")}>
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
                    className="!py-0"
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

      <div className={cn("grid grid-cols-1 gap-x-7 gap-y-4")}>
        {fields2.map((item, index) => (
          <div key={item.id}>
            <div
              className={cn(
                "grid grid-cols-1 gap-x-7 gap-y-4  w-full",
                "lg:grid-cols-2",
              )}
            >
              <FormField
                control={methods.control}
                name={`MIO12InpatientProcedure.${index}.name`}
                render={({ field }) => (
                  <FormRender label={`MIO12 Inpatient Procedure ${index + 1}`}>
                    <Input
                      {...field}
                      disabled={mode === "view"}
                      value={field.value as string}
                      className="flex-1"
                    />
                  </FormRender>
                )}
              />
              <div className="flex gap-2 mt-1">
                <FormField
                  control={methods.control}
                  name={`MIO12InpatientProcedure.${index}.dateType`}
                  render={({ field }) => (
                    <FormRender label={`Date ${index + 1}`}>
                      <SelectInput
                        options={dateTypeOptions}
                        field={field}
                        disabled={mode === "view"}
                        placeholder=""
                      />
                    </FormRender>
                  )}
                />
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={`MIO12InpatientProcedure.${index}.date`}
                    render={({ field }) => (
                      <FormRender
                        className="flex-1"
                        label={<div className="flex-1 mt-6" />}
                      >
                        <DateInput
                          onChange={field.onChange}
                          value={field.value as Date}
                          disabled={mode === "view"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            {mode !== "view" && (
              <div className={cn("flex space-x-3 items-center  mt-2")}>
                {index === fields2.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() =>
                      append2(medicationDefaultValue.medication[0])
                    }
                  >
                    <PlusIcon className="size-4" />
                    Add More
                  </Button>
                )}
                {fields2.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => remove2(index)}
                    className="!py-0"
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

export default PertinentDiagnosis;
