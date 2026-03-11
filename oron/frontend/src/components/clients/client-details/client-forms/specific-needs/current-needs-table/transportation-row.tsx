"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const transportationOptions = [
  {
    value: "Behaviors displayed during transport",
    label: "Behaviors displayed during transport",
  },
  {
    value: "No behaviors displayed",
    label: "No behaviors displayed",
  },
  {
    value: "Assistance required to fasten seat belt",
    label: "Assistance required to fasten seat belt",
  },
  { value: "Other", label: "Other" },
];

const transportAloneOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

interface TransportationRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "transportation";
}

export function TransportationRow({ control, name }: TransportationRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">
        Transportation
      </TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={transportationOptions}
          control={control}
          otherFieldName={
            `${name}.otherDescription` as Path<CurrentNeedsFormData>
          }
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name={`${name}.canBeTransportedAlone` as Path<CurrentNeedsFormData>}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Can be transported alone?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "yes")}
                  value={field.value ? "yes" : "no"}
                  className="flex flex-col space-y-1"
                >
                  {transportAloneOptions.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
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
