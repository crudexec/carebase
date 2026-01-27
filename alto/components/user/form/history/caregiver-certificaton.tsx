import { MinusIcon, PlusIcon } from "lucide-react";
import React from "react";
import { useFieldArray } from "react-hook-form";

import {
  Button,
  DateInput,
  FormField,
  FormRender,
  Input,
} from "@/components/ui";
import { cn } from "@/lib";
import { userHistoryDefaultValues, UserHistorySchema } from "@/schema";
import { ActionType, FormReturn } from "@/types";

type formType = FormReturn<typeof UserHistorySchema>;
const CareGiverCertifications = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: ActionType;
}) => {
  const { fields, remove, append } = useFieldArray({
    control: methods?.control,
    name: "caregiverCertifications",
  });

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end",
        "lg:grid-cols-2",
      )}
    >
      {fields.map((item, index) => (
        <div key={item.id} className="w-full col-span-2">
          <div className={cn("grid lg:grid-cols-2 gap-x-7 gap-y-4")}>
            <FormField
              control={methods.control}
              name={`caregiverCertifications.${index}.certification`}
              render={({ field }) => (
                <FormRender label={`Certification / License  ${index + 1}`}>
                  <Input
                    {...field}
                    type="number"
                    value={field.value as string}
                    disabled={mode === "view"}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`caregiverCertifications.${index}.expires`}
              render={({ field }) => (
                <FormRender label={`Expires  ${index + 1}`}>
                  <DateInput
                    onChange={field.onChange}
                    value={field.value as Date}
                    disabled={mode === "view"}
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
                  onClick={() =>
                    append(userHistoryDefaultValues.caregiverCertifications[0])
                  }
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
  );
};

export default CareGiverCertifications;
