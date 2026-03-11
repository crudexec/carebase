"use client";

import React, { useState, useEffect } from "react";
import { ICity, City } from "country-state-city";
import {
  FormControl,
  FormDescription,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { Control, FieldValues, Path } from "react-hook-form";
import { formatSSN } from "@/utils";
import { formatPhoneNumber } from "@/utils/helpers";
import StateField from "./StateField";
import CityField from "./CityField";

interface Props<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  withSelect?: boolean;
  selectContent?: { value: string; label: string }[];
  isStateField?: boolean;
  isCityField?: boolean;
  isSocialSecurityNumber?: boolean;
  isPhoneNumber?: boolean;
  isSelect?: boolean;
  isCheckbox?: boolean;
  isRadio?: boolean;
  isTextArea?: boolean;
  isCalendar?: boolean;
  isDateRangeCalendar?: boolean;
  isSwitch?: boolean;
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  placeholder,
  description,
  withSelect,
  selectContent,
  isStateField,
  isCityField,
  isSocialSecurityNumber,
  isPhoneNumber,
  isSelect,
  isCheckbox,
  isRadio,
  isTextArea,
  isCalendar,
  isDateRangeCalendar,
  isSwitch,
  ...inputProps
}: Props<T>) => {
  const [cities, setCities] = useState<ICity[]>([]);

  useEffect(() => {
    setCities(City.getCitiesOfState("US", control._formValues.state));
  }, [control._formValues.state]);

  const isInputField = !isCityField && !isStateField;

  return (
    <FormFieldComponent
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel htmlFor={name}>{label}</FormLabel>

          {isStateField && (
            <FormControl>
              <StateField
                field={field}
                name={name}
                placeholder={placeholder}
                disabled={disabled}
              />
            </FormControl>
          )}

          {isCityField && (
            <FormControl>
              <CityField
                field={field}
                name={name}
                placeholder={placeholder}
                cities={cities}
                control={control}
                disabled={disabled}
              />
            </FormControl>
          )}

          {isInputField && (
            <FormControl>
              <div className="relative flex items-center">
                {withSelect && (
                  <select
                    disabled={disabled}
                    name={name}
                    className="px-2 pt-[0.520rem] pb-[0.500rem] rounded-l-md border-y border-r-0 border-l border-[#CBD5E1] disabled:cursor-not-allowed"
                  >
                    <option value="US">US</option>
                  </select>
                )}

                {isSocialSecurityNumber && (
                  <Input
                    id={name}
                    className={`border-[#CBD5E1]  pr-10 rounded-md disabled:cursor-not-allowed ${
                      withSelect && "rounded-l-none rounded-r-md border-l-0"
                    } `}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    onChange={(e) => field.onChange(formatSSN(e.target.value))}
                    value={formatSSN(field.value)}
                    {...inputProps}
                  />
                )}

                {isPhoneNumber && (
                  <Input
                    id={name}
                    className={`border-[#CBD5E1]  pr-10 rounded-md disabled:cursor-not-allowed ${
                      withSelect && "rounded-l-none rounded-r-md border-l-0"
                    } `}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    onChange={(e) =>
                      field.onChange(formatPhoneNumber(e.target.value))
                    }
                    value={formatPhoneNumber(field.value)}
                    {...inputProps}
                  />
                )}

                {!isSocialSecurityNumber && !isPhoneNumber && (
                  <Input
                    id={name}
                    className={`border-[#CBD5E1]  pr-10 rounded-md disabled:cursor-not-allowed ${
                      withSelect && "rounded-l-none rounded-r-md border-l-0"
                    } `}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    {...inputProps}
                  />
                )}
              </div>
            </FormControl>
          )}

          {description && (
            <FormDescription>This is your public display name.</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
