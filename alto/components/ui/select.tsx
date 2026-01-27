"use client";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, SearchIcon } from "lucide-react";
import * as React from "react";
import { ImSpinner8 } from "react-icons/im";

import { cn } from "@/lib";

import { Input } from "./input";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    loading?: boolean;
    allowClear?: boolean;
    selectchange?: (value: string) => void;
  }
>(({ className, children, loading, allowClear, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full data-[placeholder]:text-muted-foreground  items-center text-start justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild className="min-w-4">
      {allowClear ? (
        <span
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (props.selectchange) props.selectchange("");
          }}
        >
          <Cross2Icon width={14} height={14} />
        </span>
      ) : !loading ? (
        <ChevronDown className="h-4 w-4 opacity-50" />
      ) : (
        <ImSpinner8 className="animate-spin stroke-inherit " />
      )}
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    modalSearch?: boolean;
  }
>(
  (
    { className, children, position = "popper", modalSearch = false, ...props },
    ref,
  ) =>
    !modalSearch ? (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className,
          )}
          position={position}
          {...props}
        >
          {/* <SelectScrollUpButton /> */}
          <SelectPrimitive.Viewport
            className={cn(
              // 'p-1',
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    ) : (
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {/* <SelectScrollUpButton /> */}
        <SelectPrimitive.Viewport
          className={cn(
            // 'p-1',
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

type SelectInputProps = {
  field: { onChange: (value: string) => void; value?: string | null };
  options?: { label: string; value: string; disabled?: boolean }[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  className?: string;
  modalSearch?: boolean;
};

const SelectInput = React.forwardRef<HTMLButtonElement, SelectInputProps>(
  (
    {
      field,
      options,
      placeholder = "Select an option",
      disabled,
      searchable,
      loading,
      className,
      allowClear,
      modalSearch,
    },
    ref,
  ) => {
    const [search, setSearch] = React.useState("");
    return (
      <Select
        defaultValue={field.value as string}
        onValueChange={(value) => value && field.onChange(value)}
        disabled={disabled || false}
        value={field.value as string}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex h-10 w-full data-[placeholder]:text-muted-foreground  items-center text-start justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
          <SelectPrimitive.Icon asChild className="min-w-4">
            {allowClear && !!field.value ? (
              <span
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  field.onChange("");
                }}
              >
                <Cross2Icon width={14} height={14} />
              </span>
            ) : !loading ? (
              <ChevronDown className="h-4 w-4 opacity-50" />
            ) : (
              <ImSpinner8 className="animate-spin stroke-inherit " />
            )}
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectContent modalSearch={modalSearch}>
          {searchable && (
            <div className="sticky top-0 z-50">
              <Input
                className="w-full focus-visible:ring-0 focus:outline-none focus-visible:ring-offset-0 pl-10 rounded-b-none"
                leftIcon={
                  <SearchIcon className="cursor-pointer text-gray-400 absolute left-3 top-1/2 left:top-1/2 transform -translate-y-1/2 size-4" />
                }
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {options &&
            options
              .filter((option) =>
                option.label?.toLowerCase().includes(search?.toLowerCase()),
              )
              .map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value?.toString()}
                  disabled={option?.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
    );
  },
);

SelectInput.displayName = "SelectInput";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectInput,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
