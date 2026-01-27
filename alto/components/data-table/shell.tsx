import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib";

const shellVariants = cva("grid items-center gap-8 py-4", {
  variants: {
    variant: {
      default: "p-4 md:px-8",
      sidebar: "",
      centered: " mb-16 mt-20 mx-auto max-w-md justify-center",
      markdown: "container max-w-3xl gap-0 py-8 md:py-10 lg:py-10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ShellProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
  as?: React.ElementType;
}

function Shell({
  className,
  as: Comp = "section",
  variant,
  ...props
}: ShellProps) {
  return (
    <Comp className={cn(shellVariants({ variant }), className)} {...props} />
  );
}

export { Shell, shellVariants };
