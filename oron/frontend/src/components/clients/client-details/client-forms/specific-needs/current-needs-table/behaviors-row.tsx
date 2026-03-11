"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckboxGroupWithOther } from "./checkbox-group-with-other";
import { DynamicFields } from "./dynamic-fields";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const behaviorOptions = [
  { value: "Target behavior", label: "Target behavior" },
  { value: "Behavior plan required", label: "Behavior plan required" },
  { value: "Restrictive technique", label: "Restrictive technique" },
  { value: "Other", label: "Other" },
];

interface BehaviorsRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "behaviors";
}

export function BehaviorsRow({ control, name }: BehaviorsRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">Behaviors</TableCell>
      <TableCell className="min-w-[250px]">
        <CheckboxGroupWithOther
          name={`${name}.description` as Path<CurrentNeedsFormData>}
          options={behaviorOptions}
          control={control}
          otherFieldName={
            `${name}.otherDescription` as Path<CurrentNeedsFormData>
          }
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <div className="space-y-8">
          <DynamicFields
            name="behaviors.displayedBehaviors"
            control={control}
            label="Behaviors I have displayed"
          />
          <DynamicFields
            name="behaviors.managementStrategies"
            control={control}
            label="Behavior management strategies that work for me"
          />
          <DynamicFields
            name="behaviors.triggers"
            control={control}
            label="Things that make me mad"
          />
        </div>
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
