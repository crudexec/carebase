"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  specialDates: Date[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  specialDates,
  ...props
}: CalendarProps) {
  const isDateDisabled = (date: Date) => {
    return !specialDates.some(
      (specialDate) =>
        specialDate.getDate() === date.getDate() &&
        specialDate.getMonth() === date.getMonth() &&
        specialDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      disabled={isDateDisabled}
      modifiers={
        specialDates
          ? {
              special: specialDates,
            }
          : undefined
      }
      modifiersClassNames={{
        special: "bg-blue-500 hover:bg-blue-600 text-white hover:text-white",
      }}
      className={cn("p-3 w-full", className)}
      classNames={{
        months: "flex flex-col w-full space-y-4",
        month: "w-full space-y-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
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
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-[2px] w-full relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full"
        ),
        day_selected: "bg-primary text-primary-foreground rounded-full",
        // day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
