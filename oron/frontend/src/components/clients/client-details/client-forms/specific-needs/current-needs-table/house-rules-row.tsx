"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const houseRulesOptions = [
  { value: "No smoking", label: "No smoking" },
  { value: "No use of cell phone", label: "No use of cell phone" },
  {
    value: "Respect for family privacy",
    label: "Respect for family privacy",
  },
  { value: "Other", label: "Other" },
];

interface HouseRulesRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "houseRules";
}

export function HouseRulesRow({ control, name }: HouseRulesRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">House Rules</TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={houseRulesOptions}
          control={control}
          otherFieldName={
            `${name}.otherDescription` as Path<CurrentNeedsFormData>
          }
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <DynamicFields
          name="houseRules.specificNeeds"
          control={control}
          label="My family house rules for caregivers are"
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
