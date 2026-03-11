"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const staffRatioOptions = [
  { value: "IISS (1:1)", label: "IISS (1:1)" },
  { value: "TI (1:3)", label: "TI (1:3)" },
  { value: "ITI (1:1)", label: "ITI (1:1)" },
  { value: "Respite (1:1)", label: "Respite (1:1)" },
  { value: "Other", label: "Other" },
];

interface StaffRatioRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "staffRatio";
}

export function StaffRatioRow({ control, name }: StaffRatioRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Staff Ratio</TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={staffRatioOptions}
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
                  placeholder="Enter any additional comments about staff ratio"
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
