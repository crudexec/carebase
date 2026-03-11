"use client";

import { Control, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AddButton } from "./add-button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import type { CurrentNeedsFormData } from "./schema";
import { Path } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define allowed field paths that can have dynamic fields
type DynamicFieldPaths =
  | "diagnosis.specificNeeds"
  | "nutritional.specificNeeds"
  | "health.specificNeeds"
  | "allergies.specificNeeds"
  | "medication.specificNeeds"
  | "recreational.specificNeeds"
  | "houseRules.specificNeeds"
  | "rewards.specificNeeds"
  | "behaviors.displayedBehaviors"
  | "behaviors.managementStrategies"
  | "behaviors.triggers";

interface DynamicFieldsProps {
  name: DynamicFieldPaths;
  control: Control<CurrentNeedsFormData>;
  label?: string;
}

const MAX_FIELDS = 4; // Maximum number of fields allowed

export function DynamicFields({ name, control, label }: DynamicFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
    keyName: "customId",
  });

  const handleAddField = () => {
    if (fields.length < MAX_FIELDS) {
      const nextId = String.fromCharCode(65 + fields.length);
      append({ id: nextId, value: "" });
    }
  };

  return (
    <div className="space-y-4 w-[250px]">
      {label && <div className="font-medium mb-2">{label}</div>}
      {fields.map((field, index) => (
        <FormField
          key={field.customId}
          control={control}
          name={`${name}.${index}.value` as Path<CurrentNeedsFormData>}
          render={({ field: formField }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="w-6 shrink-0">
                  {String.fromCharCode(65 + index)}:
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      {...formField}
                      value={formField.value?.toString() ?? ""}
                      placeholder="Enter here"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      ))}
      <AddButton
        onClick={handleAddField}
        className="mt-2"
        disabled={fields.length >= MAX_FIELDS}
      />
    </div>
  );
}
