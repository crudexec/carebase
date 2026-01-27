"use client";

import * as React from "react";

import { Checkbox } from "./checkbox";
import { FormControl, FormField, FormItem } from "./form";

type CheckboxGroupProps = {
  options: { value: string; label: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: any;
  name?: string;
  disabled?: boolean;
};

const CheckOneBox = ({
  options,
  methods,
  name,
  disabled,
}: CheckboxGroupProps) => {
  return (
    <>
      {options.map((item) => (
        <FormField
          key={item.value}
          control={methods.control}
          name={name ?? ""}
          render={({ field }) => {
            return (
              <FormItem
                key={item.value}
                className="flex flex-row items-center gap-2"
              >
                <FormControl>
                  <Checkbox
                    checked={field.value === item.value}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange(item.value)
                        : field.onChange("");
                    }}
                    disabled={disabled}
                  />
                </FormControl>
                <p className="text-sm font-normal !my-0 !space-y-0">
                  {item.label}
                </p>
              </FormItem>
            );
          }}
        />
      ))}
    </>
  );
};

export { CheckOneBox };
