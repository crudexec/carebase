"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "../ui/label";

interface Props {
  getDate: (date: DateRange) => void;
  className?: string;
  defaultDate?: DateRange;
  label?: string;
  isError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  selectPastDateOnly?: boolean;
  "data-testid"?: string;
}

export function DatePickerWithRange({
  className,
  getDate,
  defaultDate,
  label,
  isError,
  errorMessage,
  disabled,
  selectPastDateOnly,
  "data-testid": dataTestId,
}: Readonly<Props>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <div className="w-full flex flex-col gap-2">
        {label && (
          <Label
            data-testid={`${dataTestId}-label`}
            className={`text-[15px] text-[#0F172A] ${
              isError && "text-[#EF4444]"
            } `}
          >
            {label}
          </Label>
        )}

        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              isError && "border-[#EF4444]",
              className
            )}
            data-testid={`${dataTestId}-trigger`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Select dates</span>
            )}
          </Button>
        </PopoverTrigger>
        {errorMessage && (
          <p
            data-testid={`${dataTestId}-error`}
            className="text-[14px] text-[#EF4444] font-[400]"
          >
            {errorMessage}
          </p>
        )}
      </div>

      <PopoverContent
        data-testid={`${dataTestId}-popover`}
        className="w-full p-0 z-[7000]"
        align="start"
      >
        <Calendar
          data-testid={`${dataTestId}-calendar`}
          initialFocus
          toDate={selectPastDateOnly ? new Date() : undefined}
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(date) => {
            if (date?.from && date?.to) {
              setPopoverOpen(false);
            }
            getDate(date!);
            setDate(date);
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
