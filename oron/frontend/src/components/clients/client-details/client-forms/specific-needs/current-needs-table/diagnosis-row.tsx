"use client";

import { Control } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioGroupWithOther } from "./radio-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const diagnosisOptions = [
  { value: "Autism", label: "Autism" },
  { value: "Intellectual disability", label: "Intellectual disability" },
  { value: "Multiple disabilities", label: "Multiple disabilities" },
  { value: "Other", label: "Other" },
];

interface DiagnosisRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "diagnosis";
}

export function DiagnosisRow({ control, name }: DiagnosisRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium sticky left-0 bg-white">
        Diagnosis
      </TableCell>
      <TableCell className="w-[250px]">
        <RadioGroupWithOther
          name={`${name}.description`}
          options={diagnosisOptions}
          control={control}
          otherFieldName={`${name}.otherDescription`}
        />
      </TableCell>
      <TableCell className="w-[300px]">
        <DynamicFields
          name={`${name}.specificNeeds`}
          control={control}
          label="Diagnosis"
        />
      </TableCell>
      <TableCell className="w-[250px]">
        <FormField
          control={control}
          name={`${name}.recommendations`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter recommendations or instructions"
                  className="min-h-[100px] w-full resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
    </TableRow>
  );
}
