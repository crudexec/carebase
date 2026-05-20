"use client";

import * as React from "react";
import {
  Button,
  Input,
  DateInput,
  Label,
  SignaturePad,
  Textarea,
  Select,
} from "@/components/ui";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Circle,
  Save,
  Send,
  FileText,
  Hash,
  Calendar,
  Clock,
  Type,
  ListChecks,
  ToggleLeft,
  SlidersHorizontal,
  CircleDot,
  Plus,
  Trash2,
  List,
  Repeat,
  Pen,
  Camera,
  Star,
  Activity,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for LIST and REPEATER field configurations
interface ListConfig {
  itemType: "TEXT" | "NUMBER" | "DATE" | "TIME";
  itemLabel?: string;
  minItems?: number;
  maxItems?: number;
  placeholder?: string;
}

interface SubField {
  id: string;
  label: string;
  type: "TEXT" | "NUMBER" | "DATE" | "TIME" | "SINGLE_CHOICE" | "YES_NO";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  width?: "full" | "half" | "third";
}

interface RepeaterConfig {
  itemLabel?: string;
  addButtonLabel?: string;
  minItems?: number;
  maxItems?: number;
  subFields: SubField[];
}

interface AssessmentItem {
  id: string;
  code: string;
  question: string;
  label?: string;
  description: string | null;
  responseType: string;
  responseOptions: unknown;
  options?: unknown;
  minValue: number | null;
  maxValue: number | null;
  isRequired: boolean;
  displayOrder: number;
}

interface AssessmentSection {
  id: string;
  title: string;
  name?: string;
  description: string | null;
  sectionType: string;
  displayOrder: number;
  items: AssessmentItem[];
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
  code?: string;
  maxScore: number | null;
  sections: AssessmentSection[];
}

interface AssessmentResponse {
  itemId: string;
  numericValue: number | null;
  textValue: string | null;
  notes: string | null;
}

interface AssessmentRendererProps {
  template: AssessmentTemplate;
  responses: AssessmentResponse[];
  isReadOnly?: boolean;
  onResponseChange?: (itemId: string, value: string | number, notes?: string) => void;
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  isSaving?: boolean;
  isCompleting?: boolean;
}

// Response type icons mapping
const RESPONSE_TYPE_ICONS: Record<string, React.ElementType> = {
  TEXT: Type,
  TEXT_SHORT: Type,
  TEXT_LONG: Type,
  NUMBER: Hash,
  SCALE: SlidersHorizontal,
  RATING_SCALE: Star,
  YES_NO: ToggleLeft,
  SINGLE_SELECT: CircleDot,
  SINGLE_CHOICE: CircleDot,
  MULTI_SELECT: ListChecks,
  MULTIPLE_CHOICE: ListChecks,
  DATE: Calendar,
  TIME: Clock,
  DATETIME: Calendar,
  CLOCK_DRAWING: Clock,
  SIGNATURE: Pen,
  PHOTO: Camera,
  BODY_MAP: Activity,
  ICD10_DIAGNOSIS: Stethoscope,
  LIST: List,
  REPEATER: Repeat,
};

const TEXT_PRIORITY_RESPONSE_TYPES = new Set([
  "TEXT",
  "TEXT_SHORT",
  "TEXT_LONG",
  "DATE",
  "TIME",
  "DATETIME",
  "SINGLE_SELECT",
  "SINGLE_CHOICE",
  "MULTI_SELECT",
  "MULTIPLE_CHOICE",
  "LIST",
  "REPEATER",
  "SIGNATURE",
  "PHOTO",
  "BODY_MAP",
  "ICD10_DIAGNOSIS",
]);

export function AssessmentRenderer({
  template,
  responses,
  isReadOnly = false,
  onResponseChange,
  onSave,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: AssessmentRendererProps) {
  const [currentSection, setCurrentSection] = React.useState(0);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const sectionContentRef = React.useRef<HTMLDivElement>(null);

  const sections = template.sections || [];

  // Get response value for an item
  const getResponseValue = (item: AssessmentItem): string | number => {
    const response = responses.find((r) => r.itemId === item.id);
    if (!response) return "";
    if (TEXT_PRIORITY_RESPONSE_TYPES.has(item.responseType)) {
      return response.textValue ?? response.numericValue ?? "";
    }
    return response.numericValue ?? response.textValue ?? "";
  };

  // Check if an item has a response
  const hasResponse = (item: AssessmentItem): boolean => {
    const value = getResponseValue(item);
    return value !== "" && value !== null && value !== undefined;
  };

  const getTrackedSectionItems = (section: AssessmentSection): AssessmentItem[] => {
    const items = section.items || [];
    const requiredItems = items.filter((item) => item.isRequired);
    return requiredItems.length > 0 ? requiredItems : items;
  };

  // Check if section has all required responses
  const isSectionComplete = (section: AssessmentSection): boolean => {
    const trackedItems = getTrackedSectionItems(section);
    return trackedItems.length > 0 && trackedItems.every((item) => hasResponse(item));
  };

  // Get section progress
  const getSectionProgress = (section: AssessmentSection): { completed: number; total: number } => {
    const trackedItems = getTrackedSectionItems(section);
    const completed = trackedItems.filter((item) => hasResponse(item)).length;
    return { completed, total: trackedItems.length };
  };

  // Calculate overall progress
  const totalRequired = sections.flatMap((s) =>
    (s.items || []).filter((i) => i.isRequired)
  ).length;
  const completedRequired = sections.flatMap((s) =>
    (s.items || []).filter((i) => i.isRequired && hasResponse(i))
  ).length;
  const progressPercent = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  // Get display label for item
  const getItemLabel = (item: AssessmentItem): string => {
    return item.question || item.label || "";
  };

  // Get section name
  const getSectionName = (section: AssessmentSection): string => {
    return section.title || section.name || "";
  };

  // Scroll to top of section content when section changes
  React.useEffect(() => {
    sectionContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  // Navigate to section
  const goToSection = (index: number) => {
    setCurrentSection(index);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  // Render form field based on response type
  const renderFormField = (item: AssessmentItem, questionNumber: number) => {
    const value = getResponseValue(item);
    const options = (item.responseOptions || item.options) as { value: number | string; label: string }[] | null;
    const Icon = RESPONSE_TYPE_ICONS[item.responseType] || FileText;
    const answered = hasResponse(item);

    return (
      <div
        key={item.id}
        className={cn(
          "group relative rounded-xl border bg-white p-5 transition-all duration-200",
          answered
            ? "border-success/30 bg-success/[0.02]"
            : "border-border hover:border-primary/30 hover:shadow-sm",
          isReadOnly && "opacity-80"
        )}
      >
        {/* Question number badge */}
        <div className="absolute -left-3 -top-3">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
            answered
              ? "bg-success text-white"
              : "bg-primary/10 text-primary border border-primary/20"
          )}>
            {answered ? <CheckCircle className="h-4 w-4" /> : questionNumber}
          </div>
        </div>

        {/* Question header */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              answered ? "bg-success/10" : "bg-primary/5"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                answered ? "text-success" : "text-primary"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <Label className="text-base font-medium leading-snug text-foreground">
                {getItemLabel(item)}
                {item.isRequired && (
                  <span className="ml-1.5 text-error">*</span>
                )}
              </Label>
              {item.description && (
                <p className="mt-1.5 text-sm text-foreground-secondary leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Response field */}
        <div className="ml-11">
          {renderResponseField(item, value, options)}
        </div>
      </div>
    );
  };

  // Render the actual response input based on type
  const renderResponseField = (
    item: AssessmentItem,
    value: string | number,
    options: { value: number | string; label: string }[] | null
  ) => {
    switch (item.responseType) {
      case "SCALE": {
        const minVal = item.minValue ?? 0;
        const maxVal = item.maxValue ?? 5;
        const scaleOptions = Array.from(
          { length: maxVal - minVal + 1 },
          (_, i) => minVal + i
        );
        const midpoint = Math.floor(scaleOptions.length / 2);

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary px-1">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="flex gap-2">
              {scaleOptions.map((scaleValue, idx) => (
                <button
                  key={scaleValue}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, scaleValue)}
                  className={cn(
                    "flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    value === scaleValue
                      ? "bg-primary border-primary text-white shadow-md scale-105"
                      : cn(
                          "bg-background border-border hover:border-primary/50",
                          idx < midpoint && "hover:bg-blue-50",
                          idx === midpoint && "hover:bg-yellow-50",
                          idx > midpoint && "hover:bg-orange-50"
                        ),
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  {scaleValue}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case "YES_NO":
        return (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => onResponseChange?.(item.id, 1)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-success/20",
                value === 1
                  ? "bg-success border-success text-white shadow-md"
                  : "bg-background border-border hover:border-success/50 hover:bg-success/5 text-foreground",
                isReadOnly && "cursor-not-allowed"
              )}
            >
              <CheckCircle className="h-5 w-5" />
              Yes
            </button>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => onResponseChange?.(item.id, 0)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-error/20",
                value === 0
                  ? "bg-error border-error text-white shadow-md"
                  : "bg-background border-border hover:border-error/50 hover:bg-error/5 text-foreground",
                isReadOnly && "cursor-not-allowed"
              )}
            >
              <Circle className="h-5 w-5" />
              No
            </button>
          </div>
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            min={item.minValue ?? undefined}
            max={item.maxValue ?? undefined}
            value={value}
            onChange={(e) => onResponseChange?.(item.id, parseFloat(e.target.value) || 0)}
            disabled={isReadOnly}
            className="max-w-[200px] h-11"
            placeholder="Enter number..."
          />
        );

      case "TEXT":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            rows={4}
            placeholder="Enter your response..."
            className="resize-none"
          />
        );

      case "DATE":
        return (
          <DateInput
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[200px] h-11"
          />
        );

      case "TIME":
        return (
          <Input
            type="time"
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[200px] h-11"
          />
        );

      case "SINGLE_SELECT":
        if (options && options.length <= 4) {
          // Render as button group for small option sets
          return (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, opt.value)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    value === opt.value || String(value) === String(opt.value)
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          );
        }
        // Render as dropdown for larger option sets
        return (
          <Select
            value={String(value)}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-md h-11"
          >
            <option value="">Select an option...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );

      case "MULTI_SELECT":
        return (
          <div className="flex flex-wrap gap-2">
            {options?.map((opt) => {
              const currentValues = typeof value === "string"
                ? value.split(",").filter(Boolean)
                : [];
              const selected = currentValues.includes(String(opt.value));

              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    const newValues = selected
                      ? currentValues.filter((v) => v !== String(opt.value))
                      : [...currentValues, String(opt.value)];
                    onResponseChange?.(item.id, newValues.join(","));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    selected
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                    selected ? "border-white bg-white/20" : "border-current"
                  )}>
                    {selected && <CheckCircle className="h-3 w-3" />}
                  </div>
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case "CLOCK_DRAWING":
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-background-secondary/50 p-4 text-sm text-foreground-secondary">
              <p className="font-medium text-foreground mb-2">Instructions:</p>
              <p>Ask the patient to draw a clock showing 11:10. Score based on the criteria below.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: 0, label: "Unable to draw", desc: "Major errors present" },
                { value: 1, label: "Minor errors", desc: "Some mistakes" },
                { value: 2, label: "Perfect clock", desc: "No errors" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    value === opt.value
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  <span className="text-2xl font-bold">{opt.value}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className={cn(
                    "text-xs",
                    value === opt.value ? "text-white/80" : "text-foreground-tertiary"
                  )}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "DATETIME":
        return (
          <Input
            type="datetime-local"
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[280px] h-11"
          />
        );

      case "TEXT_SHORT":
        return (
          <Input
            type="text"
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="h-11"
            placeholder="Enter response..."
          />
        );

      case "TEXT_LONG":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            rows={4}
            placeholder="Enter your response..."
            className="resize-none"
          />
        );

      case "RATING_SCALE": {
        const minVal = item.minValue ?? 1;
        const maxVal = item.maxValue ?? 5;
        const scaleOptions = Array.from(
          { length: maxVal - minVal + 1 },
          (_, i) => minVal + i
        );

        return (
          <div className="flex gap-2">
            {scaleOptions.map((scaleValue) => (
              <button
                key={scaleValue}
                type="button"
                disabled={isReadOnly}
                onClick={() => onResponseChange?.(item.id, scaleValue)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg border-2 text-lg font-semibold transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  value === scaleValue
                    ? "bg-primary border-primary text-white shadow-md"
                    : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                  isReadOnly && "cursor-not-allowed"
                )}
              >
                {scaleValue}
              </button>
            ))}
          </div>
        );
      }

      case "SINGLE_CHOICE":
        if (options && options.length <= 4) {
          return (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onResponseChange?.(item.id, opt.value)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    value === opt.value || String(value) === String(opt.value)
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          );
        }
        return (
          <Select
            value={String(value)}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-md h-11"
          >
            <option value="">Select an option...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );

      case "MULTIPLE_CHOICE":
        return (
          <div className="flex flex-wrap gap-2">
            {options?.map((opt) => {
              const currentValues = typeof value === "string"
                ? value.split(",").filter(Boolean)
                : Array.isArray(value) ? value : [];
              const selected = currentValues.includes(String(opt.value));

              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    const newValues = selected
                      ? currentValues.filter((v) => v !== String(opt.value))
                      : [...currentValues, String(opt.value)];
                    onResponseChange?.(item.id, newValues.join(","));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    selected
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                    selected ? "border-white bg-white/20" : "border-current"
                  )}>
                    {selected && <CheckCircle className="h-3 w-3" />}
                  </div>
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case "SIGNATURE":
        if (isReadOnly) {
          return typeof value === "string" && value ? (
            <div className="rounded-lg border border-border bg-background p-4">
              <img
                src={value}
                alt="Captured signature"
                className="max-h-32 rounded border border-border bg-white"
              />
              <p className="mt-2 text-sm text-foreground-secondary">
                Signature captured
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Pen className="mx-auto mb-2 h-8 w-8 text-foreground-tertiary" />
              <p className="text-sm text-foreground-secondary">
                No signature captured
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            <SignaturePad
              value={typeof value === "string" ? value : undefined}
              onChange={(signature) => onResponseChange?.(item.id, signature || "")}
              height={120}
            />
            <p className="text-sm text-foreground-secondary">
              Tap or draw in the signature area above.
            </p>
          </div>
        );

      case "PHOTO":
        return (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Camera className="mx-auto h-8 w-8 text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-secondary">
              {isReadOnly ? "Photo captured" : "Tap to take or upload photo"}
            </p>
          </div>
        );

      case "BODY_MAP":
        return (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Activity className="mx-auto h-8 w-8 text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-secondary">
              {isReadOnly ? "Body map completed" : "Tap to mark body areas"}
            </p>
          </div>
        );

      case "ICD10_DIAGNOSIS":
        return (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-foreground-secondary">
              ICD-10 diagnosis search and selection
            </p>
          </div>
        );

      case "LIST": {
        // Extract listConfig from responseOptions
        const responseOpts = item.responseOptions as { listConfig?: ListConfig } | null;
        const listConfig = responseOpts?.listConfig;
        const itemLabel = listConfig?.itemLabel || "Item";
        const itemType = listConfig?.itemType || "TEXT";
        const maxItems = listConfig?.maxItems || 20;
        const placeholder = listConfig?.placeholder || `Enter ${itemLabel.toLowerCase()}`;

        // Parse the value as array
        let listValue: string[] = [];
        if (typeof value === "string" && value) {
          try {
            listValue = JSON.parse(value);
          } catch {
            listValue = value.split(",").filter(Boolean);
          }
        } else if (Array.isArray(value)) {
          listValue = value as string[];
        }

        const addItem = () => {
          if (listValue.length < maxItems) {
            const newList = [...listValue, ""];
            onResponseChange?.(item.id, JSON.stringify(newList));
          }
        };

        const updateItem = (index: number, newVal: string) => {
          const newList = [...listValue];
          newList[index] = newVal;
          onResponseChange?.(item.id, JSON.stringify(newList));
        };

        const removeItem = (index: number) => {
          const newList = listValue.filter((_, i) => i !== index);
          onResponseChange?.(item.id, JSON.stringify(newList));
        };

        const renderListInput = (listItem: string, index: number) => {
          switch (itemType) {
            case "NUMBER":
              return (
                <Input
                  type="number"
                  value={listItem || ""}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={placeholder}
                  disabled={isReadOnly}
                  className="flex-1 h-10"
                />
              );
            case "DATE":
              return (
                <DateInput
                  value={listItem || ""}
                  onChange={(e) => updateItem(index, e.target.value)}
                  disabled={isReadOnly}
                  className="flex-1"
                />
              );
            case "TIME":
              return (
                <Input
                  type="time"
                  value={listItem || ""}
                  onChange={(e) => updateItem(index, e.target.value)}
                  disabled={isReadOnly}
                  className="flex-1 h-10"
                />
              );
            default:
              return (
                <Input
                  type="text"
                  value={listItem || ""}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={placeholder}
                  disabled={isReadOnly}
                  className="flex-1 h-10"
                />
              );
          }
        };

        return (
          <div className="space-y-2">
            {listValue.map((listItem, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-foreground-secondary w-8 shrink-0">{index + 1}.</span>
                {renderListInput(listItem, index)}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded p-1.5 text-foreground-tertiary hover:bg-background-secondary hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {!isReadOnly && listValue.length < maxItems && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mt-2"
              >
                <Plus className="h-4 w-4" />
                Add {itemLabel}
              </button>
            )}

            {listValue.length === 0 && (
              <p className="text-sm text-foreground-tertiary">
                No items added yet. {!isReadOnly && `Click "Add ${itemLabel}" to add one.`}
              </p>
            )}
          </div>
        );
      }

      case "REPEATER": {
        // Extract repeaterConfig from responseOptions
        const responseOpts = item.responseOptions as { repeaterConfig?: RepeaterConfig } | null;
        const repeaterConfig = responseOpts?.repeaterConfig;
        const itemLabel = repeaterConfig?.itemLabel || "Item";
        const addButtonLabel = repeaterConfig?.addButtonLabel || `Add ${itemLabel}`;
        const maxItems = repeaterConfig?.maxItems || 20;
        const subFields = repeaterConfig?.subFields || [];

        // Parse the value as array of objects
        let repeaterValue: Record<string, string | number | boolean>[] = [];
        if (typeof value === "string" && value) {
          try {
            repeaterValue = JSON.parse(value);
          } catch {
            repeaterValue = [];
          }
        } else if (Array.isArray(value)) {
          repeaterValue = value as Record<string, string | number | boolean>[];
        }

        const addRepeaterItem = () => {
          if (repeaterValue.length < maxItems) {
            const newItem: Record<string, string | number | boolean> = {};
            subFields.forEach((field: SubField) => {
              newItem[field.id] = field.type === "YES_NO" ? false : "";
            });
            const newList = [...repeaterValue, newItem];
            onResponseChange?.(item.id, JSON.stringify(newList));
          }
        };

        const updateRepeaterItem = (index: number, fieldId: string, fieldValue: string | number | boolean) => {
          const newList = [...repeaterValue];
          newList[index] = { ...newList[index], [fieldId]: fieldValue };
          onResponseChange?.(item.id, JSON.stringify(newList));
        };

        const removeRepeaterItem = (index: number) => {
          const newList = repeaterValue.filter((_, i) => i !== index);
          onResponseChange?.(item.id, JSON.stringify(newList));
        };

        const renderSubField = (field: SubField, repeaterItem: Record<string, string | number | boolean>, itemIndex: number) => {
          const fieldValue = repeaterItem[field.id];

          switch (field.type) {
            case "NUMBER":
              return (
                <Input
                  type="number"
                  value={fieldValue as number || ""}
                  onChange={(e) => updateRepeaterItem(itemIndex, field.id, e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder={field.placeholder || field.label}
                  disabled={isReadOnly}
                  className="h-9"
                />
              );
            case "DATE":
              return (
                <DateInput
                  value={fieldValue as string || ""}
                  onChange={(e) => updateRepeaterItem(itemIndex, field.id, e.target.value)}
                  disabled={isReadOnly}
                />
              );
            case "TIME":
              return (
                <Input
                  type="time"
                  value={fieldValue as string || ""}
                  onChange={(e) => updateRepeaterItem(itemIndex, field.id, e.target.value)}
                  disabled={isReadOnly}
                  className="h-9"
                />
              );
            case "SINGLE_CHOICE":
              return (
                <Select
                  value={fieldValue as string || ""}
                  onChange={(e) => updateRepeaterItem(itemIndex, field.id, e.target.value)}
                  disabled={isReadOnly}
                  className="h-9"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              );
            case "YES_NO":
              return (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateRepeaterItem(itemIndex, field.id, true)}
                    disabled={isReadOnly}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      fieldValue === true
                        ? "border-success bg-success/10 text-success"
                        : "border-border hover:border-success/50",
                      isReadOnly && "cursor-not-allowed"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRepeaterItem(itemIndex, field.id, false)}
                    disabled={isReadOnly}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      fieldValue === false
                        ? "border-error bg-error/10 text-error"
                        : "border-border hover:border-error/50",
                      isReadOnly && "cursor-not-allowed"
                    )}
                  >
                    No
                  </button>
                </div>
              );
            default:
              return (
                <Input
                  type="text"
                  value={fieldValue as string || ""}
                  onChange={(e) => updateRepeaterItem(itemIndex, field.id, e.target.value)}
                  placeholder={field.placeholder || field.label}
                  disabled={isReadOnly}
                  className="h-9"
                />
              );
          }
        };

        const getFieldWidthClass = (width?: string) => {
          switch (width) {
            case "half":
              return "col-span-1";
            case "third":
              return "col-span-1";
            default:
              return "col-span-2";
          }
        };

        return (
          <div className="space-y-3">
            {repeaterValue.map((repeaterItem, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground-secondary">
                    {itemLabel} {index + 1}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeRepeaterItem(index)}
                      className="rounded p-1 text-foreground-tertiary hover:bg-background-secondary hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {subFields.map((field: SubField) => (
                    <div key={field.id} className={cn("space-y-1", getFieldWidthClass(field.width))}>
                      <label className="text-xs font-medium text-foreground-secondary">
                        {field.label}
                        {field.required && <span className="text-error ml-0.5">*</span>}
                      </label>
                      {renderSubField(field, repeaterItem, index)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!isReadOnly && repeaterValue.length < maxItems && (
              <button
                type="button"
                onClick={addRepeaterItem}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <Plus className="h-4 w-4" />
                {addButtonLabel}
              </button>
            )}

            {repeaterValue.length === 0 && (
              <p className="text-sm text-foreground-tertiary">
                No items added yet. {!isReadOnly && `Click "${addButtonLabel}" to add one.`}
              </p>
            )}
          </div>
        );
      }

      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => onResponseChange?.(item.id, e.target.value)}
            disabled={isReadOnly}
            className="h-11"
            placeholder="Enter response..."
          />
        );
    }
  };

  const currentSectionData = sections[currentSection];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* Sidebar - Section Navigator */}
      <div className={cn(
        "lg:w-72 shrink-0 transition-all duration-300",
        showSidebar ? "block" : "hidden lg:block"
      )}>
        <div className="sticky top-4 space-y-4">
          {/* Progress Card */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-primary">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2.5 bg-background-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  progressPercent === 100 ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-foreground-tertiary">
              {completedRequired} of {totalRequired} required items completed
            </p>
          </div>

          {/* Section List */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-3 bg-background-secondary/50 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Sections</h3>
            </div>
            <nav className="p-2">
              {sections.map((section, index) => {
                const progress = getSectionProgress(section);
                const isComplete = isSectionComplete(section);
                const isCurrent = currentSection === index;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                      isCurrent
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-background-secondary text-foreground"
                    )}
                  >
                    {/* Status indicator */}
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      isComplete
                        ? "bg-success text-white"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-background-secondary text-foreground-secondary"
                    )}>
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Section info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrent ? "text-primary" : "text-foreground"
                      )}>
                        {getSectionName(section)}
                      </p>
                      {progress.total > 0 && (
                        <p className="text-xs text-foreground-tertiary">
                          {progress.completed}/{progress.total} items
                        </p>
                      )}
                    </div>

                    {/* Arrow for current */}
                    {isCurrent && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Mobile Section Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="secondary"
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {currentSectionData ? getSectionName(currentSectionData) : "Sections"}
            </span>
            <span className="text-foreground-tertiary">
              Section {currentSection + 1} of {sections.length}
            </span>
          </Button>
        </div>

        {/* No sections message */}
        {sections.length === 0 && (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">
              This assessment template has no sections configured.
            </p>
          </div>
        )}

        {/* Current Section Content */}
        {currentSectionData && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-foreground-tertiary mb-2">
                    <span>Section {currentSection + 1} of {sections.length}</span>
                    {isSectionComplete(currentSectionData) && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Complete
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {getSectionName(currentSectionData)}
                  </h2>
                  {currentSectionData.description && (
                    <p className="mt-2 text-foreground-secondary">
                      {currentSectionData.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
                    disabled={currentSection === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))}
                    disabled={currentSection === sections.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div
              ref={sectionContentRef}
              className="space-y-5"
            >
              {(currentSectionData.items || []).map((item, idx) =>
                renderFormField(item, idx + 1)
              )}
            </div>

            {/* Section Navigation Footer */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Section
              </Button>
              {currentSection < sections.length - 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))}
                >
                  Next Section
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {!isReadOnly && onSave && (
                <Button variant="secondary" onClick={onSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Progress
                    </>
                  )}
                </Button>
              )}
              {!isReadOnly && onComplete && (
                <Button
                  onClick={onComplete}
                  disabled={isCompleting || progressPercent < 100}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Complete Assessment
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Completion Warning */}
            {!isReadOnly && progressPercent < 100 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">
                    Assessment Incomplete
                  </p>
                  <p className="text-sm text-warning/80">
                    Please complete all required items before submitting.{" "}
                    {totalRequired - completedRequired} items remaining.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
