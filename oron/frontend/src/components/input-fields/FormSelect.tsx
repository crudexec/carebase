import { FC, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  labelText?: string;
  defaultValue?: string;
  isError?: boolean;
  errorMessage?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  value?: string;
  placeholder: string;
  selectContent: { label: string; value: string }[];
  disabled?: boolean;
  specialItems?: string[];
  className?: string;
  "data-testid"?: string;
}

const FormSelect: FC<Props> = ({
  labelText,
  defaultValue,
  isError,
  errorMessage,
  onValueChange,
  name,
  value,
  placeholder,
  selectContent,
  disabled,
  specialItems,
  className,
  "data-testid": dataTestId,
}) => {
  useEffect(() => {
    if (defaultValue && onValueChange) {
      onValueChange(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, value]);

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        if (val && onValueChange) {
          onValueChange(val);
        } else {
          (() => {})();
        }
      }}
      disabled={disabled || selectContent.length === 0}
      defaultValue={defaultValue}
      name={name}
      data-testid={dataTestId}
    >
      <div className="w-full flex flex-col gap-2">
        {labelText && (
          <Label
            htmlFor={name}
            className={`text-[15px] text-[#0F172A] ${
              isError && "text-[#EF4444]"
            } `}
          >
            {labelText}
          </Label>
        )}

        <SelectTrigger
          id={name}
          disabled={disabled}
          className={`w-full disabled:cursor-not-allowed ${
            isError && "border-[#EF4444]"
          } ${className}`}
          data-testid={dataTestId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {errorMessage && (
          <p className="text-[14px] text-[#EF4444] font-[400]">
            {errorMessage}
          </p>
        )}
      </div>

      <SelectContent
        role="listbox"
        data-testid={dataTestId}
        className="z-[7000]"
      >
        <SelectItem className="hidden" value="#">
          Select Option
        </SelectItem>
        {selectContent.map((item) => {
          const isSpecial = specialItems && specialItems.includes(item.value);
          return (
            <SelectItem
              role="option"
              data-testid={dataTestId}
              key={item.value}
              value={item.value}
              className={`${isSpecial ? "border-[1px]" : ""}`}
              data-value={item.value}
            >
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default FormSelect;
