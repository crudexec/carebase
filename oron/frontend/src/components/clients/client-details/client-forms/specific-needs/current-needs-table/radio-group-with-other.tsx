"use client";

import { Control, useWatch, useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CurrentNeedsFormData } from "./schema";
import { Path } from "react-hook-form";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupWithOtherProps {
  name: Path<CurrentNeedsFormData>;
  options: RadioOption[];
  control: Control<CurrentNeedsFormData>;
  otherFieldName: Path<CurrentNeedsFormData>;
}

export function RadioGroupWithOther({
  name,
  options,
  control,
  otherFieldName,
}: RadioGroupWithOtherProps) {
  const selectedValue = useWatch({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value?.toString() ?? ""}
                className="flex flex-col space-y-1"
              >
                {options.map((option) => (
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

      {selectedValue === "Other" && (
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
