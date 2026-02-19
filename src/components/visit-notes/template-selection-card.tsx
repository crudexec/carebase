"use client";

import * as React from "react";
import { FileText, Clock, Layers, Check, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { FormTemplateData } from "@/lib/visit-notes/types";

interface TemplateSelectionCardProps {
  template: FormTemplateData & { id: string };
  isSelected: boolean;
  onSelect: (template: FormTemplateData & { id: string }) => void;
  isRecommended?: boolean;
  isMostUsed?: boolean;
  disabled?: boolean;
}

export function TemplateSelectionCard({
  template,
  isSelected,
  onSelect,
  isRecommended = false,
  isMostUsed = false,
  disabled = false,
}: TemplateSelectionCardProps) {
  // Calculate stats
  const sectionCount = template.sections?.length || 0;
  const fieldCount = template.sections?.reduce(
    (acc, section) => acc + (section.fields?.length || 0),
    0
  ) || 0;

  // Estimate time: ~30 seconds per field
  const estimatedMinutes = Math.max(1, Math.ceil(fieldCount * 0.5));

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(template)}
      disabled={disabled}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
        !isSelected && !disabled && "border-border hover:border-primary/50 bg-background",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
            isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          <FileText className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground">
              {template.name}
            </h3>
            {isSelected && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white flex-shrink-0">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Badges */}
          {(isRecommended || isMostUsed) && (
            <div className="flex items-center gap-2 mt-1.5">
              {isRecommended && (
                <Badge variant="success" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
              {isMostUsed && (
                <Badge variant="warning" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Most Used
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {template.description && (
            <p className="mt-2 text-sm text-foreground-secondary line-clamp-2">
              {template.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-foreground-tertiary">
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {sectionCount} section{sectionCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {fieldCount} field{fieldCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{estimatedMinutes} min
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// Template preview component for side panel
interface TemplatePreviewProps {
  template: FormTemplateData & { id: string };
  className?: string;
}

export function TemplatePreview({ template, className }: TemplatePreviewProps) {
  const sectionCount = template.sections?.length || 0;
  const fieldCount = template.sections?.reduce(
    (acc, section) => acc + (section.fields?.length || 0),
    0
  ) || 0;
  const estimatedMinutes = Math.max(1, Math.ceil(fieldCount * 0.5));

  return (
    <div className={cn("p-4 rounded-lg border bg-background-secondary", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <p className="text-xs text-foreground-secondary">Version {template.version}</p>
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-foreground-secondary mb-4">
          {template.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background">
          <Layers className="h-4 w-4 text-primary" />
          <span>{sectionCount} sections</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background">
          <Clock className="h-4 w-4 text-primary" />
          <span>~{estimatedMinutes} min</span>
        </div>
      </div>

      {/* Section list */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-foreground-tertiary uppercase tracking-wide">
          Sections
        </h4>
        {template.sections?.map((section, index) => (
          <div
            key={section.id || index}
            className="flex items-center justify-between p-2 rounded bg-background text-sm"
          >
            <span className="text-foreground">{section.title}</span>
            <span className="text-foreground-tertiary text-xs">
              {section.fields?.length || 0} fields
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
