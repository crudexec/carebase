"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-start rounded-md bg-muted px-1 text-muted-foreground max-w-full overflow-x-auto scrollbar-hide",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export type SegmentedControlProps = {
  data: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
  stretch?: boolean;
  transparent?: boolean;
  disabled?: boolean;
};

const SegmentedControl = ({
  data,
  value,
  onChange,
  children,
  className,
  stretch,
  transparent,
  disabled,
}: SegmentedControlProps) => {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className={cn(className, transparent && "bg-transparent py-0")}>
        {data.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              "disabled:opacity-100",
              stretch && "w-full",
              transparent &&
                "data-[state=active]:border-b-2 h-full data-[state=active]:border-primary rounded-none border-border border-b",
            )}
            disabled={disabled}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

export { SegmentedControl, Tabs, TabsContent, TabsList, TabsTrigger };
