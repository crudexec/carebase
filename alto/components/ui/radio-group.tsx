"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib";

import { FormControl, FormItem, FormLabel } from "./form";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full max-w-fit border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

type RadioInputProps = {
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  id?: string;
};

const RadioInput = React.forwardRef<HTMLDivElement, RadioInputProps>(
  ({ onChange, value, options, className, disabled, id }, ref) => {
    return (
      <RadioGroup
        onValueChange={onChange}
        defaultValue={value}
        value={value}
        className={cn("flex flex-col gap-1 flex-wrap", className)}
        disabled={disabled}
        ref={ref}
      >
        {options.map((option, index) => (
          <FormItem key={index} className="flex items-center gap-3 space-y-0">
            <FormControl>
              <RadioGroupItem value={option.value} id={option.value + id} />
            </FormControl>
            <FormLabel className="font-normal" htmlFor={option.value + id}>
              {option.label}
            </FormLabel>
          </FormItem>
        ))}
      </RadioGroup>
    );
  },
);

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
RadioInput.displayName = "RadioInput";

export { RadioGroup, RadioGroupItem, RadioInput };
