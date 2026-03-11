"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const supervisionOptions = [
  {
    value: "Line of sight- arm's length",
    label: "Line of sight- arm's length",
  },
  {
    value: "Line of sight with 10 feet length supervision",
    label: "Line of sight with 10 feet length supervision",
  },
  { value: "Other", label: "Other" },
];

interface SupervisionRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "supervision";
}

export function SupervisionRow({ control, name }: SupervisionRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">
        Supervision type
      </TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={supervisionOptions}
          control={control}
          otherFieldName={
            `${name}.otherDescription` as Path<CurrentNeedsFormData>
          }
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name={`${name}.comments` as Path<CurrentNeedsFormData>}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value?.toString() ?? ""}
                  placeholder="Enter any additional comments about supervision"
                  className="h-[200px] w-full"
                />
              </FormControl>
            </FormItem>
          )}
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
