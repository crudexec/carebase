"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Label } from "../ui/label";
import { CaretDownIcon } from "@radix-ui/react-icons";

interface MultiSelectProps {
  labelText: string;
  isError?: boolean;
  errorMessage?: string;
  options?: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export function MultiSelect({
  labelText,
  isError,
  errorMessage,
  options = [],
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false,
  "data-testid": dataTestId,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
      const newSelected = [...selected];
      newSelected.pop();
      onChange(newSelected);
    } else if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!selected.includes(inputValue) && !options.includes(inputValue)) {
        onChange([...selected, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleSelect = (item: string) => {
    if (!selected.includes(item)) {
      onChange([...selected, item]);
    }
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleRemove = (item: string) => {
    onChange(selected.filter((i) => i !== item));
    inputRef.current?.focus();
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

      <div className={`relative ${className}`} ref={dropdownRef}>
        <div
          data-testid={`${dataTestId}-container`}
          className={`cursor-pointer flex flex-wrap gap-2 p-2 border rounded-md bg-white ${
            isError ? "border-[#EF4444]" : "border-input"
          } ${
            disabled
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:border-gray-400"
          }`}
        >
          {selected.map((item) => (
            <span
              data-testid={`${dataTestId}-selected-item-${item}`}
              key={item}
              className="flex items-center gap-1 px-2 py-1 border-[1px] border-[#D0D5DD] rounded-md text-sm font-[500] text-[#344054]"
            >
              {item}
              <button
              type="button"
                data-testid={`${dataTestId}-remove-${item}`}
                onClick={() => handleRemove(item)}
                className="focus:outline-none"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="flex-grow outline-none bg-transparent placeholder:text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            data-testid={`${dataTestId}-input`}
          />

          <button
            data-testid={`${dataTestId}-toggle`}
            className="absolute right-0 mr-3 mt-1"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <CaretDownIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {isOpen && (
          <div
            data-testid={`${dataTestId}-dropdown`}
            className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {options
              .filter(
                (option) =>
                  !selected.includes(option) &&
                  option.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((option) => (
                <div
                  key={option}
                  data-testid={`${dataTestId}-option-${option}`}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))}
            {options.filter(
              (option) =>
                !selected.includes(option) &&
                option.toLowerCase().includes(inputValue.toLowerCase())
            ).length === 0 && (
              <div
                data-testid={`${dataTestId}-no-results`}
                className="px-4 py-2 text-gray-500 text-sm"
              >
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {isError && errorMessage && (
        <span
          data-testid={`${dataTestId}-error`}
          className="text-sm text-[#EF4444]"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
