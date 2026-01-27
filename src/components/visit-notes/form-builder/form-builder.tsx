"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { FormFieldType } from "@prisma/client";
import {
  FormTemplateData,
  FormSectionData,
  FormFieldData,
  getDefaultFieldConfig,
} from "@/lib/visit-notes/types";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Plus, X } from "lucide-react";
import { SectionItem, SectionItemOverlay } from "./section-item";
import { FieldItemOverlay } from "./field-item";
import { FieldEditor } from "./field-editor";
import { FieldTypeSelector } from "./field-type-selector";

interface FormBuilderProps {
  template: FormTemplateData;
  onChange: (template: FormTemplateData) => void;
}

type DragItem = { type: "section"; section: FormSectionData } | { type: "field"; field: FormFieldData };

export function FormBuilder({ template, onChange }: FormBuilderProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(template.sections.map((s) => s.id))
  );
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
  const [showFieldSelector, setShowFieldSelector] = React.useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = React.useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the selected field
  const selectedField = React.useMemo(() => {
    if (!selectedFieldId) return null;
    for (const section of template.sections) {
      const field = section.fields.find((f) => f.id === selectedFieldId);
      if (field) return field;
    }
    return null;
  }, [selectedFieldId, template.sections]);

  // Update template helper
  const updateTemplate = (updates: Partial<FormTemplateData>) => {
    onChange({ ...template, ...updates });
  };

  // Section operations
  const addSection = () => {
    const newSection: FormSectionData = {
      id: `section-${Date.now()}`,
      title: `Section ${template.sections.length + 1}`,
      order: template.sections.length,
      fields: [],
    };
    updateTemplate({ sections: [...template.sections, newSection] });
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  };

  const updateSection = (sectionId: string, updates: Partial<FormSectionData>) => {
    updateTemplate({
      sections: template.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    updateTemplate({
      sections: template.sections.filter((s) => s.id !== sectionId),
    });
    if (selectedFieldId) {
      const sectionToDelete = template.sections.find((s) => s.id === sectionId);
      if (sectionToDelete?.fields.some((f) => f.id === selectedFieldId)) {
        setSelectedFieldId(null);
      }
    }
  };

  // Field operations
  const addField = (sectionId: string, fieldType: FormFieldType) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newField: FormFieldData = {
      id: `field-${Date.now()}`,
      label: "New Field",
      type: fieldType,
      required: false,
      order: section.fields.length,
      config: getDefaultFieldConfig(fieldType),
    };

    updateTemplate({
      sections: template.sections.map((s) =>
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      ),
    });
    setSelectedFieldId(newField.id);
    setShowFieldSelector(null);
  };

  const updateField = (fieldId: string, updates: Partial<FormFieldData>) => {
    updateTemplate({
      sections: template.sections.map((section) => ({
        ...section,
        fields: section.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
      })),
    });
  };

  const deleteField = (fieldId: string) => {
    updateTemplate({
      sections: template.sections.map((section) => ({
        ...section,
        fields: section.fields.filter((f) => f.id !== fieldId),
      })),
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if it's a section
    const section = template.sections.find((s) => s.id === activeId);
    if (section) {
      setActiveDragItem({ type: "section", section });
      return;
    }

    // Check if it's a field
    for (const s of template.sections) {
      const field = s.fields.find((f) => f.id === activeId);
      if (field) {
        setActiveDragItem({ type: "field", field });
        return;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're moving sections
    const activeSection = template.sections.find((s) => s.id === activeId);
    const overSection = template.sections.find((s) => s.id === overId);

    if (activeSection && overSection) {
      const oldIndex = template.sections.findIndex((s) => s.id === activeId);
      const newIndex = template.sections.findIndex((s) => s.id === overId);
      const newSections = arrayMove(template.sections, oldIndex, newIndex).map(
        (s, i) => ({ ...s, order: i })
      );
      updateTemplate({ sections: newSections });
      return;
    }

    // Check if we're moving fields within a section
    for (const section of template.sections) {
      const activeFieldIndex = section.fields.findIndex((f) => f.id === activeId);
      const overFieldIndex = section.fields.findIndex((f) => f.id === overId);

      if (activeFieldIndex !== -1 && overFieldIndex !== -1) {
        const newFields = arrayMove(section.fields, activeFieldIndex, overFieldIndex).map(
          (f, i) => ({ ...f, order: i })
        );
        updateSection(section.id, { fields: newFields });
        return;
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Main builder area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Template metadata */}
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (optional)</Label>
            <Textarea
              id="template-description"
              value={template.description || ""}
              onChange={(e) =>
                updateTemplate({ description: e.target.value || undefined })
              }
              placeholder="Describe what this form is for"
              rows={2}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sections</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add section
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={template.sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {template.sections.length > 0 ? (
                <div className="space-y-3">
                  {template.sections.map((section) => (
                    <div key={section.id} className="group">
                      <SectionItem
                        section={section}
                        isExpanded={expandedSections.has(section.id)}
                        selectedFieldId={selectedFieldId}
                        onToggleExpand={() => {
                          const newExpanded = new Set(expandedSections);
                          if (newExpanded.has(section.id)) {
                            newExpanded.delete(section.id);
                          } else {
                            newExpanded.add(section.id);
                          }
                          setExpandedSections(newExpanded);
                        }}
                        onUpdateSection={(updates) => updateSection(section.id, updates)}
                        onDeleteSection={() => deleteSection(section.id)}
                        onSelectField={setSelectedFieldId}
                        onAddField={() => setShowFieldSelector(section.id)}
                        onUpdateField={updateField}
                        onDeleteField={deleteField}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-foreground-secondary">
                    No sections yet. Add a section to start building your form.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSection}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add section
                  </Button>
                </div>
              )}
            </SortableContext>

            <DragOverlay>
              {activeDragItem?.type === "section" && (
                <SectionItemOverlay section={activeDragItem.section} />
              )}
              {activeDragItem?.type === "field" && (
                <FieldItemOverlay field={activeDragItem.field} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Field type selector modal - rendered outside the section loop */}
      {showFieldSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFieldSelector(null)}
        >
          <div
            className="max-h-[80vh] w-[500px] overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Field</h3>
              <button
                type="button"
                onClick={() => setShowFieldSelector(null)}
                className="rounded p-1 hover:bg-background-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FieldTypeSelector
              onSelect={(type) => addField(showFieldSelector, type)}
            />
          </div>
        </div>
      )}

      {/* Field editor panel */}
      {selectedField && (
        <div className="w-80 border-l border-border bg-background">
          <FieldEditor
            field={selectedField}
            onChange={(updatedField) => updateField(selectedField.id, updatedField)}
            onClose={() => setSelectedFieldId(null)}
            onDelete={() => deleteField(selectedField.id)}
          />
        </div>
      )}
    </div>
  );
}
