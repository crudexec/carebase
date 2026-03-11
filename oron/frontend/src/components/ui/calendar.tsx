"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  disabledDates?: (date: Date) => boolean;
  specialDates?: Date[];
  "data-testid"?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disabledDates,
  specialDates,
  "data-testid": dataTestId,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-testid={`${dataTestId}`}
      showOutsideDays={showOutsideDays}
      modifiers={
        specialDates
          ? {
              special: specialDates,
            }
          : undefined
      }
      modifiersClassNames={{
        special: "border-[1px] bg-white text-black",
      }}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex gap-1",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-[2px] relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({
          value,
          onChange,
          children,
          name,
          ...props
        }: DropdownProps) => {
          const options = React.Children.toArray(
            children
          ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };

          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
              data-testid={`${dataTestId}-${name}-select`}
            >
              <SelectTrigger
                data-testid={`${dataTestId}-${name}-trigger`}
                className="pr-1.5 focus:ring-0 z-[5000]"
              >
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent
                data-testid={`${dataTestId}-${name}-content`}
                className="z-[50000]"
                position="popper"
              >
                <ScrollArea className="h-80 z-[5000]">
                  {options.map((option, id: number) => (
                    <SelectItem
                      key={`${option.props.value}-${id}`}
                      value={option.props.value?.toString() ?? ""}
                      data-testid={`${dataTestId}-${name}-option-${option.props.value}`}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: ({ ...props }) => (
          <button data-testid="calendar-left-icon">
            <ChevronLeft className="h-4 w-4" />
          </button>
        ),
        IconRight: ({ ...props }) => (
          <button data-testid="calendar-right-icon">
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      }}
      disabled={disabledDates}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
