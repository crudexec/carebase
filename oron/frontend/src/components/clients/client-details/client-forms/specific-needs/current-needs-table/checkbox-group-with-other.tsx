"use client";

import { Control, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { CurrentNeedsFormData } from "./schema";
import { Path } from "react-hook-form";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupWithOtherProps {
  name: Path<CurrentNeedsFormData>;
  options: CheckboxOption[];
  control: Control<CurrentNeedsFormData>;
  otherFieldName: Path<CurrentNeedsFormData>;
}

export function CheckboxGroupWithOther({
  name,
  options,
  control,
  otherFieldName,
}: CheckboxGroupWithOtherProps) {
  const selectedValues = useWatch({
    control,
    name,
  }) as string[];

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              {options.map((option) => (
                <FormField
                  key={option.value}
                  control={control}
                  name={name}
                  render={({ field: arrayField }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={(
                              (arrayField.value as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValues =
                                (arrayField.value as string[]) || [];

                              if (option.value === "Other") {
                                // If Other is selected, clear all other options
                                if (checked) {
                                  arrayField.onChange(["Other"]);
                                } else {
                                  arrayField.onChange([]);
                                }
                              } else {
                                // If a regular option is selected, remove Other if it exists
                                if (checked) {
                                  arrayField.onChange([
                                    ...currentValues.filter(
                                      (v) => v !== "Other"
                                    ),
                                    option.value,
                                  ]);
                                } else {
                                  arrayField.onChange(
                                    currentValues.filter(
                                      (value: string) => value !== option.value
                                    )
                                  );
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </FormItem>
        )}
      />

      {selectedValues?.includes("Other") && (
        <FormField
          control={control}
          name={otherFieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  value={field.value?.toString() ?? ""}
                  placeholder="Please specify"
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
