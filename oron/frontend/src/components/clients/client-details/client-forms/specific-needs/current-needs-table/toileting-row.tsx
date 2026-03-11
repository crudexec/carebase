"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioGroupWithOther } from "./radio-group-with-other";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const toiletingOptions = [
  { value: "Toilet trained", label: "Toilet trained" },
  { value: "Occasional accidents", label: "Occasional accidents" },
  { value: "Not toilet trained", label: "Not toilet trained" },
  { value: "Incontinent", label: "Incontinent" },
  { value: "Other", label: "Other" },
];

const toiletingFrequencyOptions = [
  { value: "Every 30 minutes", label: "Every 30 minutes" },
  { value: "Every hour", label: "Every hour" },
  { value: "Every 2 hours", label: "Every 2 hours" },
  { value: "Every 3 hours", label: "Every 3 hours" },
  { value: "Every 4 hours", label: "Every 4 hours" },
];

interface ToiletingRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "toileting";
}

export function ToiletingRow({ control, name }: ToiletingRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Toileting</TableCell>
      <TableCell className="min-w-[250px]">
        <RadioGroupWithOther
          name={`${name}.description`}
          options={toiletingOptions}
          control={control}
          otherFieldName={`${name}.otherDescription`}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name={`${name}.frequency` as Path<CurrentNeedsFormData>}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <Label>For toileting, I am:</Label>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString() ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {toiletingFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
