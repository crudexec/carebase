"use client";

import { FC, useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  labelText: string;
  isError?: boolean;
  errorMessage?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  value?: string;
  placeholder: string;
  selectContent: { label: string; value: string }[];
  disabled?: boolean;
  "data-testid"?: string;
}

const SearchableFormSelect: FC<Props> = ({
  labelText,
  isError,
  errorMessage,
  onValueChange,
  name,
  value,
  placeholder,
  selectContent = [],
  disabled,
  "data-testid": dataTestId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = selectContent.find((item) => item.value === value);

  const filteredContent = selectContent.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full flex flex-col gap-2" ref={dropdownRef}>
      <label
        htmlFor={name}
        className={`text-[15px] ${
          isError ? "text-[#EF4444]" : "text-[#0F172A]"
        }`}
      >
        {labelText}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }
          }}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            disabled && "bg-gray-100",
            isError && "border-[#EF4444]"
          )}
          disabled={disabled}
        >
          <span className={!selectedItem ? "text-muted-foreground" : ""}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 opacity-50 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-[7000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 text-sm border-b border-gray-200 focus:outline-none"
                placeholder={`Search ${labelText.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto">
              {filteredContent.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No {labelText.toLowerCase()} found
                </div>
              ) : (
                filteredContent.map((item) => (
                  <div
                    key={item.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center
                      ${value === item.value ? "bg-gray-50" : ""}
                    `}
                    onClick={() => handleSelect(item.value)}
                  >
                    <div className="w-4 mr-2">
                      {value === item.value && (
                        <Check className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    {item.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-[14px] text-[#EF4444] font-[400]">{errorMessage}</p>
      )}
    </div>
  );
};

export default SearchableFormSelect;
