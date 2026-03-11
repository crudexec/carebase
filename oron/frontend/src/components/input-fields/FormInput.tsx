"use client";

import { ChangeEvent, FC, useEffect, useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface Props extends InputProps {
  name: string;
  placeholder: string;
  type: string;
  labelText?: string;
  defaultValue?: string;
  isError?: boolean;
  errorMessage?: string;
  isAuth?: boolean;
  withSelect?: boolean;
  selectValue?: string[];
  selectDefaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  isPhoneNumber?: boolean;
}

const FormInput: FC<Props> = ({
  name,
  placeholder,
  type,
  labelText,
  isError,
  errorMessage,
  isAuth,
  withSelect,
  selectValue,
  selectDefaultValue,
  defaultValue,
  value,
  onChange,
  disabled,
  onBlur,
  isPhoneNumber,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(e);
  };

  return (
    <div
      className={`${
        !isAuth
          ? "grid w-full items-center gap-2"
          : "grid w-full xl:w-[90%] items-center gap-2"
      }`}
    >
      {labelText && (
        <Label
          className={`text-[15px] text-[#0F172A] font-[600] ${
            isError && "text-[#EF4444]"
          } `}
          htmlFor={name}
        >
          {labelText}
        </Label>
      )}

      <div className="relative flex items-center">
        {withSelect && (
          <select
            disabled={disabled}
            name={`${name}-select`}
            className="px-2 pt-[0.520rem] pb-[0.500rem] rounded-l-md border-y border-r-0 border-l border-[#CBD5E1] disabled:cursor-not-allowed"
            defaultValue={selectDefaultValue}
          >
            {selectValue?.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}

        <Input
          onChange={handleInputChange}
          value={value}
          defaultValue={defaultValue}
          type={showPassword ? "text" : type}
          id={name}
          name={name}
          placeholder={placeholder}
          className={`border-[#CBD5E1]  pr-10 rounded-md disabled:cursor-not-allowed ${
            withSelect && "rounded-l-none rounded-r-md border-l-0"
          } ${isError && "border-[#EF4444]"} `}
          disabled={disabled}
          onBlur={onBlur}
          {...props}
        />

        {type === "password" && (
          <button
            disabled={disabled}
            type="button"
            className="absolute right-2 top-2 focus:outline-none disabled:cursor-not-allowed"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeIcon className="text-[#98A2B3] w-5 h-5" />
            ) : (
              <EyeOffIcon className="text-[#98A2B3] w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="text-[14px] text-[#EF4444] font-[400]">
          {errorMessage.replaceAll("null", "")}
        </p>
      )}
    </div>
  );
};

export default FormInput;
