"use client";

import * as React from "react";
import {
  Button,
  Input,
  DateInput,
  Textarea,
  Label,
  Select,
  SignaturePad,
  Rating,
} from "@/components/ui";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  FileText,
  Hash,
  Calendar,
  Clock,
  Type,
  Pilcrow,
  ListChecks,
  ToggleLeft,
  Star,
  Camera,
  PenTool,
  User,
  Stethoscope,
  AlignLeft,
  // OASIS field type icons
  Binary,
  Grid3X3,
  CalendarDays,
  GitBranch,
  Calculator,
  PlusSquare,
  KeyRound,
  FilePlus2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ICD10DiagnosisField } from "@/components/visit-notes/form-renderer/icd10-diagnosis-field";
import { BodyMapField } from "@/components/visit-notes/form-renderer/body-map-field";
import { CascadingSelectField } from "@/components/care-plans/form-renderer/cascading-select-field";
import { RepeatableGroupField } from "@/components/care-plans/form-renderer/repeatable-group-field";
import { FormFieldType } from "@prisma/client";
import { ICD10DiagnosisValue, BodyMapMarker } from "@/lib/visit-notes/types";
import { CascadingSelectValue, RepeatableGroupFieldConfig, RepeatableGroupItemValue } from "@/lib/care-plans/types";

interface TemplateField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: Record<string, unknown> | null;
}

interface TemplateSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: TemplateField[];
}

interface CarePlanTemplate {
  id: string;
  name: string;
  description: string | null;
  version: number;
  sections: TemplateSection[];
}

type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | ICD10DiagnosisValue[]
  | BodyMapMarker[]
  | CascadingSelectValue
  | RepeatableGroupItemValue[]
  | { fileUrl: string; fileName: string; fileType: string; fileSize: number }
  | null;

interface CarePlanRendererProps {
  template: CarePlanTemplate;
  formData: Record<string, FieldValue>;
  isReadOnly?: boolean;
  onFieldChange?: (fieldId: string, value: FieldValue) => void;
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  isSaving?: boolean;
  isCompleting?: boolean;
}

// Field type icons mapping
const FIELD_TYPE_ICONS: Record<FormFieldType, React.ComponentType<{ className?: string }>> = {
  TEXT_SHORT: Type,
  TEXT_LONG: AlignLeft,
  TEXT_DISPLAY: Pilcrow,
  NUMBER: Hash,
  YES_NO: ToggleLeft,
  SINGLE_CHOICE: ListChecks,
  MULTIPLE_CHOICE: ListChecks,
  DATE: Calendar,
  TIME: Clock,
  DATETIME: Calendar,
  SIGNATURE: PenTool,
  PHOTO: Camera,
  RATING_SCALE: Star,
  BODY_MAP: User,
  ICD10_DIAGNOSIS: Stethoscope,
  CASCADING_SELECT: GitBranch,
  REPEATABLE_GROUP: Layers,
  // OASIS field types
  CODE_ENTRY: Binary,
  MATRIX_GRID: Grid3X3,
  DATE_PARTS: CalendarDays,
  HIERARCHICAL_CHECKBOX: GitBranch,
  CALCULATED_SCORE: Calculator,
  NUMERIC_COUNTER: PlusSquare,
  STRUCTURED_ID: KeyRound,
  MULTI_DIAGNOSIS: FilePlus2,
};

export function CarePlanRenderer({
  template,
  formData,
  isReadOnly = false,
  onFieldChange,
  onSave,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: CarePlanRendererProps) {
  const [currentSection, setCurrentSection] = React.useState(0);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const sectionContentRef = React.useRef<HTMLDivElement>(null);

  const sections = template.sections || [];

  // Get field value
  const getFieldValue = (fieldId: string): FieldValue => {
    return formData[fieldId] ?? null;
  };

  // Check if a field has a value
  const hasValue = (fieldId: string): boolean => {
    const value = getFieldValue(fieldId);
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  };

  // Check if section has all required fields completed
  // Only mark as complete if there ARE required fields and they're all filled
  const isSectionComplete = (section: TemplateSection): boolean => {
    const requiredFields = section.fields.filter((f) => f.required);
    // If no required fields, section is not considered "complete" (show section number instead)
    if (requiredFields.length === 0) return false;
    return requiredFields.every((field) => hasValue(field.id));
  };

  // Get section progress
  const getSectionProgress = (section: TemplateSection): { completed: number; total: number } => {
    const requiredFields = section.fields.filter((f) => f.required);
    const completed = requiredFields.filter((field) => hasValue(field.id)).length;
    return { completed, total: requiredFields.length };
  };

  // Calculate overall progress
  const totalRequired = sections.flatMap((s) => s.fields.filter((f) => f.required)).length;
  const completedRequired = sections.flatMap((s) =>
    s.fields.filter((f) => f.required && hasValue(f.id))
  ).length;
  const progressPercent = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100;

  // Scroll to top of section content when section changes
  React.useEffect(() => {
    sectionContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  // Navigate to section
  const goToSection = (index: number) => {
    setCurrentSection(index);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  // Render form field based on type
  const renderFormField = (field: TemplateField, fieldNumber: number) => {
    const value = getFieldValue(field.id);
    const config = field.config || {};
    const Icon = FIELD_TYPE_ICONS[field.type] || FileText;
    const answered = hasValue(field.id);

    return (
      <div
        key={field.id}
        className={cn(
          "group relative rounded-xl border bg-white p-5 transition-all duration-200",
          answered
            ? "border-success/30 bg-success/[0.02]"
            : "border-border hover:border-primary/30 hover:shadow-sm",
          isReadOnly && "opacity-80"
        )}
      >
        {/* Field number badge */}
        <div className="absolute -left-3 -top-3">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
              answered
                ? "bg-success text-white"
                : "bg-primary/10 text-primary border border-primary/20"
            )}
          >
            {answered ? <CheckCircle className="h-4 w-4" /> : fieldNumber}
          </div>
        </div>

        {/* Field header */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                answered ? "bg-success/10" : "bg-primary/5"
              )}
            >
              <Icon className={cn("h-4 w-4", answered ? "text-success" : "text-primary")} />
            </div>
            <div className="flex-1 min-w-0">
              <Label className="text-base font-medium leading-snug text-foreground">
                {field.label}
                {field.required && <span className="ml-1.5 text-error">*</span>}
              </Label>
            </div>
          </div>
        </div>

        {/* Field input */}
        <div className="ml-11">{renderFieldInput(field, value, config)}</div>
      </div>
    );
  };

  // Render the actual input based on field type
  const renderFieldInput = (
    field: TemplateField,
    value: FieldValue,
    config: Record<string, unknown>
  ) => {
    switch (field.type) {
      case "TEXT_SHORT":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            placeholder={(config.placeholder as string) || ""}
            maxLength={config.maxLength as number}
            className="h-11"
          />
        );

      case "TEXT_LONG":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            placeholder={(config.placeholder as string) || ""}
            maxLength={config.maxLength as number}
            rows={4}
            className="resize-none"
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value !== null && value !== undefined ? String(value) : ""}
            onChange={(e) =>
              onFieldChange?.(field.id, e.target.value ? parseFloat(e.target.value) : null)
            }
            disabled={isReadOnly}
            min={config.min as number}
            max={config.max as number}
            step={config.step as number}
            placeholder={(config.placeholder as string) || ""}
            className="max-w-[200px] h-11"
          />
        );

      case "YES_NO":
        return (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => onFieldChange?.(field.id, true)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-success/20",
                value === true
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
              onClick={() => onFieldChange?.(field.id, false)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-error/20",
                value === false
                  ? "bg-error border-error text-white shadow-md"
                  : "bg-background border-border hover:border-error/50 hover:bg-error/5 text-foreground",
                isReadOnly && "cursor-not-allowed"
              )}
            >
              <AlertCircle className="h-5 w-5" />
              No
            </button>
          </div>
        );

      case "SINGLE_CHOICE": {
        const options = (config.options as string[]) || [];
        if (options.length <= 4) {
          return (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onFieldChange?.(field.id, opt)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    value === opt
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5",
                    isReadOnly && "cursor-not-allowed"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          );
        }
        return (
          <Select
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-md h-11"
          >
            <option value="">Select an option...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        );
      }

      case "MULTIPLE_CHOICE": {
        const options = (config.options as string[]) || [];
        const selectedValues = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = selectedValues.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    const newValues = selected
                      ? selectedValues.filter((v) => v !== opt)
                      : [...selectedValues, opt];
                    onFieldChange?.(field.id, newValues);
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
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                      selected ? "border-white bg-white/20" : "border-current"
                    )}
                  >
                    {selected && <CheckCircle className="h-3 w-3" />}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        );
      }

      case "DATE":
        return (
          <DateInput
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[200px] h-11"
          />
        );

      case "TIME":
        return (
          <Input
            type="time"
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[200px] h-11"
          />
        );

      case "DATETIME":
        return (
          <Input
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            className="max-w-[280px] h-11"
          />
        );

      case "SIGNATURE":
        return (
          <SignaturePad
            value={(value as string) || undefined}
            onChange={(v) => onFieldChange?.(field.id, v || null)}
            disabled={isReadOnly}
          />
        );

      case "RATING_SCALE":
        return (
          <Rating
            value={(value as number) || 0}
            onChange={(v) => onFieldChange?.(field.id, v)}
            min={(config.min as number) || 1}
            max={(config.max as number) || 5}
            labels={config.labels as Record<number, string>}
            disabled={isReadOnly}
          />
        );

      case "BODY_MAP":
        return (
          <BodyMapField
            value={(value as BodyMapMarker[]) || []}
            onChange={(v) => onFieldChange?.(field.id, v)}
            disabled={isReadOnly}
          />
        );

      case "ICD10_DIAGNOSIS":
        return (
          <ICD10DiagnosisField
            value={(value as ICD10DiagnosisValue[]) || []}
            onChange={(v) => onFieldChange?.(field.id, v)}
            disabled={isReadOnly}
          />
        );

      case "CASCADING_SELECT":
        return (
          <CascadingSelectField
            value={(value as CascadingSelectValue) || null}
            onChange={(v) => onFieldChange?.(field.id, v)}
            config={{
              hierarchyId: config.hierarchyId as string | undefined,
              templateType: config.templateType as string | undefined,
              allowMultipleSteps: config.allowMultipleSteps as boolean | undefined,
              showSteps: config.showSteps as boolean | undefined,
            }}
            disabled={isReadOnly}
          />
        );

      case "REPEATABLE_GROUP":
        return (
          <RepeatableGroupField
            value={(value as RepeatableGroupItemValue[]) || null}
            onChange={(v) => onFieldChange?.(field.id, v)}
            config={config as unknown as RepeatableGroupFieldConfig}
            disabled={isReadOnly}
          />
        );

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onFieldChange?.(field.id, e.target.value)}
            disabled={isReadOnly}
            className="h-11"
            placeholder="Enter value..."
          />
        );
    }
  };

  const currentSectionData = sections[currentSection];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* Sidebar - Section Navigator */}
      <div
        className={cn(
          "lg:w-72 shrink-0 transition-all duration-300",
          showSidebar ? "block" : "hidden lg:block"
        )}
      >
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
              {completedRequired} of {totalRequired} required fields completed
            </p>
          </div>

          {/* Section List */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-3 bg-background-secondary/50 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Sections</h3>
            </div>
            <nav className="p-2 max-h-[60vh] overflow-y-auto">
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
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        isComplete
                          ? "bg-success text-white"
                          : isCurrent
                            ? "bg-primary text-white"
                            : "bg-background-secondary text-foreground-secondary"
                      )}
                    >
                      {isComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>

                    {/* Section info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurrent ? "text-primary" : "text-foreground"
                        )}
                      >
                        {section.title}
                      </p>
                      {progress.total > 0 && (
                        <p className="text-xs text-foreground-tertiary">
                          {progress.completed}/{progress.total} required
                        </p>
                      )}
                    </div>

                    {/* Arrow for current */}
                    {isCurrent && <ChevronRight className="h-4 w-4 text-primary" />}
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
              {currentSectionData ? currentSectionData.title : "Sections"}
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
              This care plan template has no sections configured.
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
                    <span>
                      Section {currentSection + 1} of {sections.length}
                    </span>
                    {isSectionComplete(currentSectionData) && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Complete
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {currentSectionData.title}
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
                    onClick={() =>
                      setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))
                    }
                    disabled={currentSection === sections.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div ref={sectionContentRef} className="space-y-5">
              {currentSectionData.fields
                .sort((a, b) => a.order - b.order)
                .map((field, idx) => renderFormField(field, idx + 1))}
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
                  onClick={() =>
                    setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))
                  }
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
                <Button onClick={onComplete} disabled={isCompleting || progressPercent < 100}>
                  {isCompleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Care Plan
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
                  <p className="text-sm font-medium text-warning">Care Plan Incomplete</p>
                  <p className="text-sm text-warning/80">
                    Please complete all required fields before submitting.{" "}
                    {totalRequired - completedRequired} fields remaining.
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
