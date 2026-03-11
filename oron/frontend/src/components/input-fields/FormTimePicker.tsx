"use client";

import React, { FC, useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  name: string;
  placeholder: string;
  labelText: string;
  defaultValue?: string;
  isError?: boolean;
  errorMessage?: string;
  isAuth?: boolean;
  value?: string;
  onChange?: (newValue: string | null) => void;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  "data-testid"?: string;
}

const FormTimePicker: FC<Props> = ({
  name,
  placeholder,
  labelText,
  isError,
  errorMessage,
  isAuth,
  defaultValue,
  value,
  onChange,
  disabled,
  onBlur,
  "data-testid": dataTestId,
}) => {
  // Convert string time to Date object
  const parseTimeString = (timeStr?: string): Date | null => {
    if (!timeStr) return null;
    try {
      return parse(timeStr, "h:mm aa", new Date());
    } catch {
      return null;
    }
  };

  const [selectedTime, setSelectedTime] = useState<Date | null>(() =>
    parseTimeString(value || defaultValue)
  );

  useEffect(() => {
    if (value) {
      setSelectedTime(parseTimeString(value));
    }
  }, [value]);

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    newValue: string
  ) => {
    const currentTime = selectedTime || new Date();
    let newTime = new Date(currentTime);

    if (type === "hour") {
      const hour = parseInt(newValue, 10);
      const isPM = newTime.getHours() >= 12;
      newTime.setHours(isPM ? hour + 12 : hour);
    } else if (type === "minute") {
      newTime.setMinutes(parseInt(newValue, 10));
    } else if (type === "ampm") {
      const hours = newTime.getHours();
      if (newValue === "AM" && hours >= 12) {
        newTime.setHours(hours - 12);
      } else if (newValue === "PM" && hours < 12) {
        newTime.setHours(hours + 12);
      }
    }

    setSelectedTime(newTime);
    if (onChange) {
      onChange(format(newTime, "h:mm aa"));
    }
  };

  return (
    <div
      className={`${
        !isAuth
          ? "grid w-full items-center gap-2"
          : "grid w-full xl:w-[90%] items-center gap-2"
      }`}
    >
      <Label
        htmlFor={name}
        className={`text-[15px] text-[#0F172A] ${isError && "text-[#EF4444]"} `}
      >
        {labelText}
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            data-testid={dataTestId}
            variant="outline"
            disabled={disabled}
            className={`w-full pl-3 text-left font-normal flex justify-between items-center ${
              isError
                ? "border-[#EF4444] hover:border-[#EF4444]"
                : "border-[#CBD5E1]"
            }`}
          >
            <span>
              {selectedTime ? (
                format(selectedTime, "h:mm aa")
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit max-w-fit p-0 z-[7000]" align="start">
          <div className="flex">
            <ScrollArea className="w-fit">
              <div className="flex flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      selectedTime && selectedTime.getHours() % 12 === hour % 12
                        ? "default"
                        : "ghost"
                    }
                    onClick={() => handleTimeChange("hour", hour.toString())}
                    data-testid={`${dataTestId}-hour-${hour}`}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="w-fit">
              <div className="flex flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      selectedTime && selectedTime.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                    data-testid={`${dataTestId}-minute-${minute}`}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="w-fit">
              <div className="flex flex-col p-2">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      selectedTime &&
                      ((ampm === "AM" && selectedTime.getHours() < 12) ||
                        (ampm === "PM" && selectedTime.getHours() >= 12))
                        ? "default"
                        : "ghost"
                    }
                    onClick={() => handleTimeChange("ampm", ampm)}
                    data-testid={`${dataTestId}-${ampm.toLowerCase()}`}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className="text-[14px] text-[#EF4444] font-[400]">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormTimePicker;
