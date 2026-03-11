"use client";

import type { ReactNode } from "react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";

interface BaseRowProps {
  label: string;
  children: ReactNode;
  control: Control<CurrentNeedsFormData>;
  name: keyof CurrentNeedsFormData;
}

export function BaseRow({ label, children, control, name }: BaseRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-normal">{label}</TableCell>
      <TableCell className="whitespace-normal">{children}</TableCell>
      <TableCell className="whitespace-normal">
        <FormField
          control={control}
          name={`${name}.recommendations`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter recommendations or instructions"
                  className="min-h-[100px] w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
    </TableRow>
  );
}
