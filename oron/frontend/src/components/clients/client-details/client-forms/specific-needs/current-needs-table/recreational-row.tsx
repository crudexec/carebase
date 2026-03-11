"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const recreationalOptions = [
  { value: "Special interests", label: "Special interests" },
  { value: "Hobbies", label: "Hobbies" },
  { value: "Community outings", label: "Community outings" },
  { value: "Other", label: "Other" },
];

interface RecreationalRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "recreational";
}

export function RecreationalRow({ control, name }: RecreationalRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Recreational</TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={recreationalOptions}
          control={control}
          otherFieldName={
            `${name}.otherDescription` as Path<CurrentNeedsFormData>
          }
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <DynamicFields
          name="recreational.specificNeeds"
          control={control}
          label="My hobbies"
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
