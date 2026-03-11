"use client";

import { Control } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioGroupWithOther } from "./radio-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const allergiesOptions = [
  { value: "None", label: "None" },
  { value: "Seasonal", label: "Seasonal" },
  { value: "Food allergies", label: "Food allergies" },
  { value: "Other", label: "Other" },
];

interface AllergiesRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "allergies";
}

export function AllergiesRow({ control, name }: AllergiesRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Allergies</TableCell>
      <TableCell className="min-w-[250px]">
        <RadioGroupWithOther
          name={`${name}.description`}
          options={allergiesOptions}
          control={control}
          otherFieldName={`${name}.otherDescription`}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <DynamicFields
          name={`${name}.specificNeeds`}
          control={control}
          label="Medical History/Allergies"
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
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
