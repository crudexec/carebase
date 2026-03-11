"use client";

import { Control } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioGroupWithOther } from "./radio-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const healthOptions = [
  { value: "Generally well", label: "Generally well" },
  { value: "Some concerns", label: "Some concerns" },
  { value: "Other", label: "Other" },
];

interface HealthRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "health";
}

export function HealthRow({ control, name }: HealthRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Health</TableCell>
      <TableCell className="min-w-[250px]">
        <RadioGroupWithOther
          name={`${name}.description`}
          options={healthOptions}
          control={control}
          otherFieldName={`${name}.otherDescription`}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <DynamicFields
          name={`${name}.specificNeeds`}
          control={control}
          label="Unusual health problems"
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
