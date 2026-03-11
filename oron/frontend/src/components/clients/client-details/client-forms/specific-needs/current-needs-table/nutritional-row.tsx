"use client";

import { Control } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioGroupWithOther } from "./radio-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const nutritionalOptions = [
  { value: "Regular diet", label: "Regular diet" },
  { value: "Restricted diet", label: "Restricted diet" },
  { value: "Modified diet", label: "Modified diet" },
  { value: "Other", label: "Other" },
];

interface NutritionalRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "nutritional";
}

export function NutritionalRow({ control, name }: NutritionalRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium w-[15%]">
        Nutritional / Dietary
      </TableCell>
      <TableCell className="w-[25%]">
        <RadioGroupWithOther
          name={`${name}.description`}
          options={nutritionalOptions}
          control={control}
          otherFieldName={`${name}.otherDescription`}
        />
      </TableCell>
      <TableCell className="w-[30%]">
        <DynamicFields
          name={`${name}.specificNeeds`}
          control={control}
          label="My favorite food/snacks are"
        />
      </TableCell>
      <TableCell className="w-[30%]">
        <FormField
          control={control}
          name={`${name}.recommendations`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter recommendations or instructions"
                  className="h-[200px] w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
    </TableRow>
  );
}
