import React, { ReactNode } from "react";

import { cn } from "@/lib";

const Flex = ({
  className,
  col,
  gap = 2,
  children,
}: {
  className?: string;
  col?: boolean;
  children: ReactNode;
  gap?: number;
}) => {
  return (
    <div
      className={cn(
        `flex items-${col ? "start" : "center"}`,
        `gap-${gap} ${col ? "flex-col" : "flex-row"}`,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Flex;
