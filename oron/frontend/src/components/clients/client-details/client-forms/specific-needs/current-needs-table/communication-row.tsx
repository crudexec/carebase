"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const communicationOptions = [
  { value: "Verbal", label: "Verbal" },
  { value: "Non-verbal", label: "Non-verbal" },
  { value: "Sign language", label: "Sign language" },
  { value: "Communication device", label: "Communication device" },
  { value: "Picture exchange", label: "Picture exchange" },
];

interface CommunicationRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "communication";
}

export function CommunicationRow({ control, name }: CommunicationRowProps) {
  return (
    <TableRow className="hover:bg-none">
      <TableCell className="font-medium min-w-[150px]">Communication</TableCell>
      <TableCell className="min-w-[250px]">
        <FormField
          control={control}
          name={`${name}.description`}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value?.toString() ?? ""}
                  className="flex flex-col space-y-1"
                >
                  {communicationOptions.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <Label className="font-normal">{option.label}</Label>
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
          name={`${name}.specificNeeds`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter communication details"
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
