"use client";

import { ChangeEvent, FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  labelText?: string;
  placeholder: string;
  name: string;
  isError?: boolean;
  errorMessage?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  "data-testid"?: string;
}

const FormTextArea: FC<Props> = ({
  labelText,
  placeholder,
  name,
  isError,
  errorMessage,
  defaultValue,
  value,
  onChange,
  disabled,
  required,
  "data-testid": dataTestId,
  ...props
}) => {
  return (
    <div className="grid w-full items-center gap-2">
      {labelText && (
        <Label
          className={`text-[15px] text-[#0F172A] ${
            isError && "text-[#EF4444]"
          } `}
          htmlFor={name}
        >
          {labelText}
        </Label>
      )}

      <Textarea
        {...props}
        disabled={disabled}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${isError && "border-[#EF4444]"}`}
        required={required}
        data-testid={dataTestId}
      />
      {errorMessage && (
        <p className="text-[14px] text-[#EF4444] font-[400]">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormTextArea;
