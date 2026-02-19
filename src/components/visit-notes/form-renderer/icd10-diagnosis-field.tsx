"use client";

import * as React from "react";
import { ICD10Search, DiagnosisItem } from "@/components/care-plan/icd10-search";
import { ICD10DiagnosisValue } from "@/lib/visit-notes/types";

interface ICD10DiagnosisFieldProps {
  value: ICD10DiagnosisValue[];
  onChange: (value: ICD10DiagnosisValue[]) => void;
  disabled?: boolean;
  maxItems?: number;
}

export function ICD10DiagnosisField({
  value = [],
  onChange,
  disabled,
  maxItems,
}: ICD10DiagnosisFieldProps) {
  const handleSelect = (code: string, description: string) => {
    // Check if already added
    if (value.some((d) => d.code === code)) return;

    // Check max items
    if (maxItems && value.length >= maxItems) return;

    const newDiagnosis: ICD10DiagnosisValue = {
      code,
      description,
      type: value.length === 0 ? "PRIMARY" : "SECONDARY",
    };

    onChange([...value, newDiagnosis]);
  };

  const handleRemove = (code: string) => {
    onChange(value.filter((d) => d.code !== code));
  };

  const handleTypeChange = (code: string, type: string) => {
    onChange(
      value.map((d) =>
        d.code === code
          ? { ...d, type: type as ICD10DiagnosisValue["type"] }
          : d
      )
    );
  };

  return (
    <div className="space-y-3">
      {!disabled && (
        <ICD10Search
          onSelect={handleSelect}
          placeholder="Search ICD-10 codes (e.g., diabetes, E11)..."
        />
      )}

      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((diagnosis) => (
            <DiagnosisItem
              key={diagnosis.code}
              code={diagnosis.code}
              description={diagnosis.description}
              type={diagnosis.type || "SECONDARY"}
              onRemove={() => handleRemove(diagnosis.code)}
              onTypeChange={(type) => handleTypeChange(diagnosis.code, type)}
              isEditable={!disabled}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground-tertiary py-2">
          No diagnoses added yet. Search above to add ICD-10 codes.
        </p>
      )}
    </div>
  );
}
