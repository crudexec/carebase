"use client";

import React, { FC, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";

interface Props {
  labelText: string;
  options: string[];
  isError?: boolean;
  errorMessage?: string;
  onChange?: (selected: string[]) => void;
  defaultSelected?: string[];
  placeholder?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

const FormMultiSelect: FC<Props> = ({
  labelText,
  options,
  isError = false,
  errorMessage = "",
  onChange,
  defaultSelected = [],
  placeholder = "Select items",
  disabled = false,
  "data-testid": dataTestId,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    defaultSelected.filter((item) => item.trim() !== "")
  );
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    if (value.trim() === "") return;
    const isSelected = selectedItems.includes(value);
    const updatedSelection = isSelected
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];
    setSelectedItems(updatedSelection);
    onChange && onChange(updatedSelection);
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    if (value.trim() === "") return;
    const updatedSelection = selectedItems.filter((item) => item !== value);
    setSelectedItems(updatedSelection);
    onChange && onChange(updatedSelection);
  };

  const handleInputBoxClick = () => {
    if (!disabled && options.length > 0) {
      selectTriggerRef.current?.click();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <Label
        htmlFor="multi-select"
        className={`text-[15px] ${
          isError ? "text-[#EF4444]" : "text-[#0F172A]"
        }`}
      >
        {labelText}
      </Label>

      <div
        ref={inputBoxRef}
        onClick={handleInputBoxClick}
        className={`w-full border rounded-md flex items-center gap-2 px-2 min-h-[40px] cursor-pointer ${
          isError ? "border-[#EF4444]" : "border-input"
        } ${
          disabled
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        }`}
      >
        <div className="flex flex-1 flex-wrap gap-2 py-1">
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1 px-2 py-1 border-[1px] border-[#D0D5DD] rounded-md text-sm font-[500] text-[#344054]"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, item)}
                  disabled={disabled}
                  className="focus:outline-none"
                >
                  <XIcon className="h-4 w-4 text-[#98A2B3] hover:text-gray-700" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
        <Select
          onValueChange={handleSelect}
          disabled={disabled || options.length === 0}
          data-testid={dataTestId}
        >
          <SelectTrigger
            ref={selectTriggerRef}
            className="ml-auto flex items-center justify-between w-6 min-w-[24px] border-none p-0 focus:ring-0"
            data-testid={dataTestId}
          />
          <SelectContent
            className="z-[7000] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
            position="popper"
            style={{
              width: inputBoxRef.current?.offsetWidth + "px",
            }}
          >
            {options
              .filter((option) => option.trim() !== "")
              .map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className={selectedItems.includes(option) ? "font-bold" : ""}
                >
                  {option}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {isError && errorMessage && (
        <span className="text-sm text-[#EF4444]">{errorMessage}</span>
      )}
    </div>
  );
};

export default FormMultiSelect;
