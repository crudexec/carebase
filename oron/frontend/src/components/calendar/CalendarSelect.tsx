"use client";

import { useEffect } from "react";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface Props {
  getDate: (date: Date) => void;
  defaultDate?: Date;
  label: string;
  isError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  selectPastDateOnly?: boolean;
  selectFutureDateOnly?: boolean;
  isDateAllowed?: (date: Date) => boolean;
  specialDates?: Date[];
  "data-testid"?: string;
}

export function DatePicker({
  getDate,
  defaultDate,
  label,
  isError,
  errorMessage,
  disabled,
  selectPastDateOnly,
  selectFutureDateOnly,
  isDateAllowed,
  specialDates,
  "data-testid": dataTestId,
}: Readonly<Props>) {
  const [date, setDate] = React.useState<Date>();
  const [popoverOpen, setPopopverOpen] = React.useState(false);

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopopverOpen} modal>
      <div className="w-full flex flex-col gap-2">
        <Label
          className={`text-[15px] text-[#0F172A] ${
            isError && "text-[#EF4444]"
          } `}
          data-testid={`${dataTestId}-label`}
        >
          {label}
        </Label>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              isError && "border-[#EF4444]"
            )}
            data-testid={dataTestId}
            aria-label="Choose date"
            role="combobox"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        {errorMessage && (
          <p
            className="text-[14px] text-[#EF4444] font-[400]"
            data-testid={`${dataTestId}-error`}
          >
            {errorMessage}
          </p>
        )}
      </div>

      <PopoverContent
        onClick={(e) => e.stopPropagation()}
        className="w-auto p-0 z-[7000]"
        align="start"
        role="dialog"
        aria-label="Calendar"
      >
        <Calendar
          className="z-[4000]"
          fromYear={selectFutureDateOnly ? undefined : 1900}
          toYear={selectPastDateOnly ? undefined : 2090}
          fromDate={selectFutureDateOnly ? new Date() : undefined}
          toDate={selectPastDateOnly ? new Date() : undefined}
          mode="single"
          captionLayout="dropdown-buttons"
          selected={date}
          onSelect={(e) => {
            if (e) {
              getDate(e!);
              setDate(e);
              setPopopverOpen(false);
            }
          }}
          disabledDates={isDateAllowed}
          specialDates={specialDates}
          data-testid={`${dataTestId}`}
        />
      </PopoverContent>
    </Popover>
  );
}
