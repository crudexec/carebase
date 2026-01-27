import React from "react";

import { cn } from "@/lib";

const Detail = ({
  title,
  detail,
  helperText,
  className,
}: {
  title: string;
  detail?: string | null;
  helperText?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `flex gap-3 ${className}`,
        helperText ? "items-start" : "items-center",
      )}
    >
      <div>
        <p className="font-bold">{title}:</p>
        {helperText && (
          <p className="text-sm text-foreground/60">{helperText}</p>
        )}
      </div>
      <p>{detail ?? "-"}</p>
    </div>
  );
};

export default Detail;
