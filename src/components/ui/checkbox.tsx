import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-start gap-2 cursor-pointer select-none"
      >
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            id={inputId}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border bg-white transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
              "checked:bg-primary checked:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-error" : "border-border",
              className
            )}
            ref={ref}
            {...props}
          />
          <Check className="pointer-events-none absolute inset-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
        </div>
        {label && (
          <span className="text-sm text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
