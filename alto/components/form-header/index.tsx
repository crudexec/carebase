import React, { PropsWithChildren } from "react";

import { cn } from "@/lib";

const FormHeader = ({
  className,
  children,
}: PropsWithChildren & { className?: string }) => {
  return (
    <div
      className={cn(
        "md:px-8 mt-12 text-center px-2 bg-secondary border-b border-b-border flex justify-center items-center uppercase font-semibold  py-2 mb-4 sticky top-0 z-[1]",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default FormHeader;
