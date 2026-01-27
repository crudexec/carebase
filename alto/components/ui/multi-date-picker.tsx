import React from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";

const MultiDatePicker = ({
  field,
  disabled,
  minDate,
  maxDate,
}: {
  field: {
    value: DateObject[] | null;
    onChange: (dates: DateObject[] | DateObject | null) => void;
  };
  disabled?: boolean;
  minDate?: Date | string | number | DateObject;
  maxDate?: Date | string | number | DateObject;
}) => {
  return (
    <DatePicker
      inputClass="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      className="dark:!bg-[#020817] dark:!text-white custom-calendar"
      value={field.value || []}
      multiple
      sort
      numberOfMonths={2}
      format={"DD/MM/YYYY"}
      disabled={disabled}
      onChange={(dates) => {
        field.onChange(dates);
      }}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};

export default MultiDatePicker;
