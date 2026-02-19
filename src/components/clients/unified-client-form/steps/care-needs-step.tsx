"use client";

import * as React from "react";
import { Input, Label, Select, Textarea } from "@/components/ui";
import { HeartPulse } from "lucide-react";
import { StepProps, SERVICE_OPTIONS, URGENCY_OPTIONS } from "../types";
import { cn } from "@/lib/utils";

export function CareNeedsStep({ data, onChange }: StepProps) {
  const handleServiceToggle = (service: string) => {
    const current = data.requestedServices || [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    onChange({ requestedServices: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Care Needs</h2>
          <p className="text-sm text-foreground-secondary">
            Specify the care services and requirements
          </p>
        </div>
      </div>

      {/* Primary Diagnosis */}
      <div className="space-y-2">
        <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
        <Input
          id="primaryDiagnosis"
          value={data.primaryDiagnosis}
          onChange={(e) => onChange({ primaryDiagnosis: e.target.value })}
          placeholder="ICD-10 code or description"
        />
      </div>

      {/* Requested Services */}
      <div className="space-y-3">
        <Label>Requested Services</Label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((service) => {
            const isSelected = data.requestedServices?.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                {service}
              </button>
            );
          })}
        </div>
        {data.requestedServices && data.requestedServices.length > 0 && (
          <p className="text-xs text-foreground-secondary">
            {data.requestedServices.length} service{data.requestedServices.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Hours and Urgency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hoursRequested">Hours Requested (per week)</Label>
          <Input
            id="hoursRequested"
            type="number"
            min="0"
            step="0.5"
            value={data.hoursRequested}
            onChange={(e) => onChange({ hoursRequested: e.target.value })}
            placeholder="e.g., 20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency</Label>
          <Select
            id="urgency"
            value={data.urgency}
            onChange={(e) => onChange({ urgency: e.target.value as "ROUTINE" | "URGENT" | "STAT" })}
          >
            {URGENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Special Needs */}
      <div className="space-y-2">
        <Label htmlFor="specialNeeds">Special Needs / Notes</Label>
        <Textarea
          id="specialNeeds"
          value={data.specialNeeds}
          onChange={(e) => onChange({ specialNeeds: e.target.value })}
          rows={3}
          placeholder="Any special requirements, preferences, or notes about care needs..."
        />
      </div>
    </div>
  );
}
