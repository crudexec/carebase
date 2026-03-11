"use client";

import * as React from "react";
import { Button, Input, Select } from "@/components/ui";
import { Save, Trash2, GripVertical, ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { OasisSectionEditor } from "./oasis-section-editor";
import type { OasisSectionCode, OasisTimePoint } from "@/lib/oasis/types";
import { FormFieldType } from "@prisma/client";

export interface TemplateItemData {
  id: string;
  code: string;
  label: string;
  description?: string;
  helpText?: string;
  fieldType: FormFieldType;
  required: boolean;
  order: number;
  visibleAt: OasisTimePoint[];
  config: Record<string, unknown>;
  skipLogic?: unknown[];
}

export interface TemplateSectionData {
  id: string;
  code: string;
  name: string;
  description?: string;
  order: number;
  items: TemplateItemData[];
  isExpanded?: boolean;
}

export interface TemplateData {
  id?: string;
  name: string;
  version: string;
  description?: string;
  effectiveDate: string;
  sections: TemplateSectionData[];
}

interface OasisTemplateBuilderProps {
  initialTemplate?: TemplateData;
  onSave: (template: TemplateData) => Promise<void>;
  onCancel?: () => void;
}

const SECTION_CODES: { code: OasisSectionCode; name: string }[] = [
  { code: "A", name: "Administrative Information" },
  { code: "B", name: "Patient History and Diagnoses" },
  { code: "C", name: "Cognitive Patterns" },
  { code: "D", name: "Mood" },
  { code: "E", name: "Behavior" },
  { code: "F", name: "Preferences for Customary Routine" },
  { code: "GG", name: "Functional Abilities and Goals" },
  { code: "H", name: "Bladder and Bowel" },
  { code: "I", name: "Active Diagnoses" },
  { code: "J", name: "Health Conditions" },
  { code: "K", name: "Swallowing/Nutritional Status" },
  { code: "M", name: "Skin Conditions" },
  { code: "N", name: "Medications" },
  { code: "O", name: "Special Treatments and Procedures" },
  { code: "P", name: "Restraints" },
  { code: "Q", name: "Participation in Assessment" },
  { code: "Z", name: "Assessment Administration" },
];

const DEFAULT_TEMPLATE: TemplateData = {
  name: "",
  version: "E2",
  description: "",
  effectiveDate: new Date().toISOString().split("T")[0],
  sections: [],
};

export function OasisTemplateBuilder({
  initialTemplate,
  onSave,
  onCancel,
}: OasisTemplateBuilderProps) {
  const [template, setTemplate] = React.useState<TemplateData>(
    initialTemplate || DEFAULT_TEMPLATE
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const handleTemplateChange = (field: keyof TemplateData, value: unknown) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSection = (sectionCode?: OasisSectionCode) => {
    const code = sectionCode || ("A" as OasisSectionCode);
    const sectionInfo = SECTION_CODES.find((s) => s.code === code);

    const newSection: TemplateSectionData = {
      id: `section-${Date.now()}`,
      code,
      name: sectionInfo?.name || `Section ${code}`,
      description: "",
      order: template.sections.length,
      items: [],
      isExpanded: true,
    };

    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setActiveSection(newSection.id);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<TemplateSectionData>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i })),
    }));
    if (activeSection === sectionId) {
      setActiveSection(null);
    }
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const index = template.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.sections.length) return;

    const newSections = [...template.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

    setTemplate((prev) => ({
      ...prev,
      sections: newSections.map((s, i) => ({ ...s, order: i })),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(template);
    } finally {
      setIsSaving(false);
    }
  };

  const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {template.id ? "Edit OASIS Template" : "Create OASIS Template"}
          </h1>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !template.name}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>

        {/* Template metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <Input
              value={template.name}
              onChange={(e) => handleTemplateChange("name", e.target.value)}
              placeholder="OASIS-E2 Standard"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <Input
              value={template.version}
              onChange={(e) => handleTemplateChange("version", e.target.value)}
              placeholder="E2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Effective Date</label>
            <Input
              type="date"
              value={template.effectiveDate}
              onChange={(e) => handleTemplateChange("effectiveDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={template.description || ""}
              onChange={(e) => handleTemplateChange("description", e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-foreground-secondary">
          <span>{template.sections.length} sections</span>
          <span>{totalItems} items</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sections list */}
        <div className="w-80 border-r overflow-y-auto bg-background-secondary/30">
          <div className="p-3 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Sections</h2>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSection(e.target.value as OasisSectionCode);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">+ Add Section</option>
                {SECTION_CODES.filter(
                  (sc) => !template.sections.some((s) => s.code === sc.code)
                ).map((sc) => (
                  <option key={sc.code} value={sc.code}>
                    {sc.code}: {sc.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {template.sections.length === 0 ? (
              <div className="text-center py-8 text-foreground-tertiary">
                <p className="text-sm">No sections yet</p>
                <p className="text-xs mt-1">Add a section to get started</p>
              </div>
            ) : (
              template.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      activeSection === section.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-background-secondary border border-transparent"
                    )}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <GripVertical className="h-4 w-4 text-foreground-tertiary opacity-0 group-hover:opacity-100" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {section.code}: {section.name}
                      </div>
                      <div className="text-xs text-foreground-tertiary">
                        {section.items.length} items
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, "up");
                        }}
                        disabled={index === 0}
                        className="p-1 hover:bg-background-tertiary rounded disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, "down");
                        }}
                        disabled={index === template.sections.length - 1}
                        className="p-1 hover:bg-background-tertiary rounded disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="p-1 hover:bg-error/10 hover:text-error rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Section editor */}
        <div className="flex-1 overflow-y-auto">
          {activeSection ? (
            <OasisSectionEditor
              section={template.sections.find((s) => s.id === activeSection)!}
              onUpdate={(updates) => handleUpdateSection(activeSection, updates)}
              onDelete={() => handleDeleteSection(activeSection)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-foreground-tertiary">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a section to edit</p>
                <p className="text-sm mt-1">or add a new section from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
