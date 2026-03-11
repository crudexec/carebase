"use client";

import { Control, Path } from "react-hook-form";
import type { CurrentNeedsFormData } from "./schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";

interface CommentsRowProps {
  control: Control<CurrentNeedsFormData>;
  name: "communityOuting" | "specialAlerts";
  label: string;
  category: string;
}

export function CommentsRow({
  control,
  name,
  label,
  category,
}: CommentsRowProps) {
  return (
    <TableRow className="hover:bg-white">
      <TableCell className="font-medium min-w-[150px]">{label}</TableCell>
      <TableCell className="min-w-[250px]">
        {/* This cell intentionally left empty to maintain consistent layout */}
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name={`${name}.comments` as Path<CurrentNeedsFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{label}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value?.toString() ?? ""}
                  placeholder={`Enter ${label.toLowerCase()} details`}
                  className="h-[200px] w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name={`${name}.recommendations` as Path<CurrentNeedsFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Recommendations</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value?.toString() ?? ""}
                  placeholder="Enter recommendations or instructions"
                  className="h-[200px] w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
    </TableRow>
  );
}
