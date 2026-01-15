import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background-secondary text-foreground",
        primary: "bg-primary/20 text-foreground",
        success: "bg-success/20 text-foreground",
        warning: "bg-warning/20 text-foreground",
        error: "bg-error/20 text-foreground",
        info: "bg-info/20 text-foreground",
        // Role badges
        admin: "bg-role-admin text-foreground",
        "ops-manager": "bg-role-ops-manager text-foreground",
        clinical: "bg-role-clinical text-foreground",
        staff: "bg-role-staff text-foreground",
        supervisor: "bg-role-supervisor text-foreground",
        carer: "bg-role-carer text-foreground",
        sponsor: "bg-role-sponsor text-foreground",
        // Severity badges
        "severity-low": "bg-severity-low text-foreground",
        "severity-medium": "bg-severity-medium text-foreground",
        "severity-high": "bg-severity-high text-foreground",
        "severity-critical": "bg-severity-critical text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
