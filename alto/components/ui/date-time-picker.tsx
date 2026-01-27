"use client";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { Matcher } from "react-day-picker";

import { addTimeToDate, cn } from "@/lib";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type DateTimeInputProps = {
  onChange: (value?: Date) => void;
  value?: Date;
  disabled?: boolean;
  ref?: HTMLElement;
  minDate?: Date;
  maxDate?: Date;
};

const DateTimeInputComponent = React.forwardRef<
  HTMLElement,
  DateTimeInputProps
>(({ onChange, value, disabled, minDate, maxDate }, _ref) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [time, setTime] = useState(dayjs().format("HH:mm"));
  const timeRef = React.useRef<HTMLInputElement>(null);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    const date = addTimeToDate(time, value);
    onChange(date);
  };

  const dateRange = {
    ...(minDate ? { before: minDate } : {}),
    ...(maxDate ? { after: maxDate } : {}),
  };

  return (
    <Popover
      modal={true}
      open={isCalendarOpen}
      onOpenChange={setIsCalendarOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal z-100 py-5",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            `${dayjs(value).format("MMM D, YYYY hh:mm A")}`
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden z-[50]">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(e) => {
            const date = addTimeToDate(time, e as Date);
            onChange(date);
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          disabled={dateRange as Matcher}
          fromYear={1960}
          toYear={2100}
        />

        <Input
          type="time"
          ref={timeRef}
          onClick={() => timeRef.current?.showPicker()}
          value={dayjs(value).format("HH:mm")}
          onChange={(e) => {
            setTime(e.target.value);
            handleTimeChange(e);
          }}
          className="rounded-none focus-visible:ring-0 focus:outline-none focus-visible:ring-offset-0 border-x-0 border-b-0"
        />
      </PopoverContent>
    </Popover>
  );
});

DateTimeInputComponent.displayName = "DateTimeInput";

export const DateTimeInput = DateTimeInputComponent;
