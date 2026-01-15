"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  labels?: Record<number, string>;
  className?: string;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value = 0,
      onChange,
      max = 5,
      min = 1,
      disabled,
      error,
      size = "md",
      showValue = true,
      labels,
      className,
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const displayValue = hoverValue ?? value;
    const currentLabel = labels?.[displayValue];

    const handleClick = (rating: number) => {
      if (disabled) return;
      onChange?.(rating);
    };

    const handleMouseEnter = (rating: number) => {
      if (disabled) return;
      setHoverValue(rating);
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    const stars = [];
    for (let i = min; i <= max; i++) {
      const isFilled = i <= displayValue;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          className={cn(
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-foreground-tertiary hover:text-yellow-400"
            )}
          />
        </button>
      );
    }

    return (
      <div ref={ref} className={cn("space-y-1", className)}>
        <div
          className={cn(
            "flex items-center gap-1",
            error && "text-error"
          )}
        >
          {stars}
          {showValue && (
            <span className="ml-2 text-sm text-foreground-secondary">
              {displayValue}/{max}
            </span>
          )}
        </div>
        {currentLabel && (
          <p className="text-sm text-foreground-secondary">{currentLabel}</p>
        )}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };
