"use client";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem } from "./command";

export type Framework = Record<"value" | "label", string>;

function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: Framework[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>(value || []);

  React.useEffect(() => {
    setSelected(value || []);
  }, [value]);

  const handleUnselect = React.useCallback(
    (value: string) => {
      onChange(selected.filter((s) => s !== value));
      setSelected((prev) => prev.filter((s) => s !== value));
    },
    [onChange, selected],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
            onChange(selected.slice(0, -1));
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [onChange, selected],
  );

  const selectables = options.filter((framework) =>
    selected?.length ? !selected?.includes(framework.value) : true,
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected?.map((framework) => {
            return (
              <Badge key={framework} variant="secondary">
                {options.find((f) => f.value === framework)?.label}
                {!disabled && (
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 py-1.5"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(framework);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    type="button"
                    onClick={() => handleUnselect(framework)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </button>
                )}
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            disabled={disabled}
            onFocus={() => setOpen(true)}
            placeholder={placeholder || "Select one or more options"}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      {open && selectables.length > 0 ? (
        <div className="relative">
          <div className="absolute mt-2 max-h-80 overflow-auto w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((framework) => {
                return (
                  <CommandItem
                    key={framework.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue("");
                      onChange([...(selected ?? []), framework.value]);
                      setSelected((prev) => [...prev, framework.value]);
                    }}
                    className={"cursor-pointer"}
                  >
                    {framework.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        </div>
      ) : null}
    </Command>
  );
}
export { MultiSelect };
