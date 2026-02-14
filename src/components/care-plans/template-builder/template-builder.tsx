"use client";

import * as React from "react";
import { FormFieldType, FormTemplateStatus } from "@prisma/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  Badge,
} from "@/components/ui";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Save,
} from "lucide-react";
import {
  CarePlanTemplateSectionData,
  CarePlanTemplateFieldData,
  FIELD_TYPE_LABELS,
  DEFAULT_FIELD_CONFIGS,
  ChoiceOption,
} from "@/lib/care-plans/types";

interface TemplateBuilderProps {
  initialData?: {
    id?: string;
    name: string;
    description: string | null;
    status: FormTemplateStatus;
    version: number;
    isEnabled: boolean;
    includesDiagnoses: boolean;
    includesGoals: boolean;
    includesInterventions: boolean;
    includesMedications: boolean;
    includesOrders: boolean;
    sections: CarePlanTemplateSectionData[];
  };
  onSave: (data: {
    name: string;
    description: string | null;
    status: FormTemplateStatus;
    isEnabled: boolean;
    includesDiagnoses: boolean;
    includesGoals: boolean;
    includesInterventions: boolean;
    includesMedications: boolean;
    includesOrders: boolean;
    sections: CarePlanTemplateSectionData[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const generateId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function TemplateBuilder({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
}: TemplateBuilderProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [status, setStatus] = React.useState<FormTemplateStatus>(initialData?.status || "DRAFT");
  const [isEnabled, setIsEnabled] = React.useState(initialData?.isEnabled || false);
  const [includesDiagnoses, setIncludesDiagnoses] = React.useState(initialData?.includesDiagnoses ?? true);
  const [includesGoals, setIncludesGoals] = React.useState(initialData?.includesGoals ?? true);
  const [includesInterventions, setIncludesInterventions] = React.useState(initialData?.includesInterventions ?? true);
  const [includesMedications, setIncludesMedications] = React.useState(initialData?.includesMedications ?? true);
  const [includesOrders, setIncludesOrders] = React.useState(initialData?.includesOrders ?? true);
  const [sections, setSections] = React.useState<CarePlanTemplateSectionData[]>(
    initialData?.sections || []
  );
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const [editingField, setEditingField] = React.useState<string | null>(null);

  // Add a new section
  const addSection = () => {
    const newSection: CarePlanTemplateSectionData = {
      id: generateId(),
      title: `Section ${sections.length + 1}`,
      description: null,
      order: sections.length,
      fields: [],
    };
    setSections([...sections, newSection]);
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  };

  // Update a section
  const updateSection = (sectionId: string, updates: Partial<CarePlanTemplateSectionData>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  // Delete a section
  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  };

  // Move section up
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    newSections.forEach((s, i) => (s.order = i));
    setSections(newSections);
  };

  // Move section down
  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((s, i) => (s.order = i));
    setSections(newSections);
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Add a new field to a section
  const addField = (sectionId: string, fieldType: FormFieldType) => {
    const newField: CarePlanTemplateFieldData = {
      id: generateId(),
      label: `New ${FIELD_TYPE_LABELS[fieldType]}`,
      type: fieldType,
      required: false,
      order: sections.find((s) => s.id === sectionId)?.fields.length || 0,
      config: DEFAULT_FIELD_CONFIGS[fieldType] || {},
    };

    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      )
    );
    setEditingField(newField.id);
  };

  // Update a field
  const updateField = (
    sectionId: string,
    fieldId: string,
    updates: Partial<CarePlanTemplateFieldData>
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      )
    );
  };

  // Delete a field
  const deleteField = (sectionId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      )
    );
    if (editingField === fieldId) {
      setEditingField(null);
    }
  };

  // Move field up
  const moveFieldUp = (sectionId: string, fieldIndex: number) => {
    if (fieldIndex === 0) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newFields = [...s.fields];
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = [
          newFields[fieldIndex],
          newFields[fieldIndex - 1],
        ];
        newFields.forEach((f, i) => (f.order = i));
        return { ...s, fields: newFields };
      })
    );
  };

  // Move field down
  const moveFieldDown = (sectionId: string, fieldIndex: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || fieldIndex === section.fields.length - 1) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newFields = [...s.fields];
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = [
          newFields[fieldIndex + 1],
          newFields[fieldIndex],
        ];
        newFields.forEach((f, i) => (f.order = i));
        return { ...s, fields: newFields };
      })
    );
  };

  // Handle save
  const handleSave = async () => {
    await onSave({
      name,
      description: description || null,
      status,
      isEnabled,
      includesDiagnoses,
      includesGoals,
      includesInterventions,
      includesMedications,
      includesOrders,
      sections: sections.map((s, sIdx) => ({
        ...s,
        order: sIdx,
        fields: s.fields.map((f, fIdx) => ({ ...f, order: fIdx })),
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Template Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as FormTemplateStatus)}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this template..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Enable for use</span>
            </label>
          </div>

          {/* Built-in sections toggles */}
          <div className="border-t border-border pt-4 mt-4">
            <Label className="mb-3 block">Built-in Sections</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesDiagnoses}
                  onChange={(e) => setIncludesDiagnoses(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Diagnoses</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesGoals}
                  onChange={(e) => setIncludesGoals(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Goals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesInterventions}
                  onChange={(e) => setIncludesInterventions(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Interventions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesMedications}
                  onChange={(e) => setIncludesMedications(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Medications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesOrders}
                  onChange={(e) => setIncludesOrders(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Orders</span>
              </label>
            </div>
            <p className="text-xs text-foreground-tertiary mt-2">
              These standard sections will be included in care plans using this template.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Custom Sections</CardTitle>
          <Button onClick={addSection} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-12 text-foreground-secondary">
              <p>No custom sections yet.</p>
              <p className="text-sm mt-1">
                Add sections to create custom fields for your care plans.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  sectionIndex={sectionIndex}
                  totalSections={sections.length}
                  isExpanded={expandedSections.has(section.id)}
                  editingField={editingField}
                  onToggle={() => toggleSection(section.id)}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onDelete={() => deleteSection(section.id)}
                  onMoveUp={() => moveSectionUp(sectionIndex)}
                  onMoveDown={() => moveSectionDown(sectionIndex)}
                  onAddField={(type) => addField(section.id, type)}
                  onUpdateField={(fieldId, updates) =>
                    updateField(section.id, fieldId, updates)
                  }
                  onDeleteField={(fieldId) => deleteField(section.id, fieldId)}
                  onMoveFieldUp={(fieldIndex) => moveFieldUp(section.id, fieldIndex)}
                  onMoveFieldDown={(fieldIndex) => moveFieldDown(section.id, fieldIndex)}
                  onEditField={setEditingField}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
}

// Section Card Component
interface SectionCardProps {
  section: CarePlanTemplateSectionData;
  sectionIndex: number;
  totalSections: number;
  isExpanded: boolean;
  editingField: string | null;
  onToggle: () => void;
  onUpdate: (updates: Partial<CarePlanTemplateSectionData>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddField: (type: FormFieldType) => void;
  onUpdateField: (fieldId: string, updates: Partial<CarePlanTemplateFieldData>) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveFieldUp: (fieldIndex: number) => void;
  onMoveFieldDown: (fieldIndex: number) => void;
  onEditField: (fieldId: string | null) => void;
}

function SectionCard({
  section,
  sectionIndex,
  totalSections,
  isExpanded,
  editingField,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveFieldUp,
  onMoveFieldDown,
  onEditField,
}: SectionCardProps) {
  const [showFieldPicker, setShowFieldPicker] = React.useState(false);

  return (
    <div className="border border-border rounded-lg">
      {/* Section Header */}
      <div
        className="flex items-center gap-3 p-3 bg-background-secondary cursor-pointer"
        onClick={onToggle}
      >
        <GripVertical className="w-4 h-4 text-foreground-tertiary" />
        <div className="flex-1">
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="font-medium bg-transparent border-none p-0 h-auto focus:ring-0"
            placeholder="Section title"
          />
        </div>
        <Badge variant="default">{section.fields.length} fields</Badge>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={sectionIndex === 0}
            className="p-1 text-foreground-tertiary hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={sectionIndex === totalSections - 1}
            className="p-1 text-foreground-tertiary hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-foreground-tertiary hover:text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-foreground-tertiary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground-tertiary" />
          )}
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={section.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value || null })}
              placeholder="Section description..."
              rows={2}
            />
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <div className="relative">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowFieldPicker(!showFieldPicker)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Field
                </Button>
                {showFieldPicker && (
                  <FieldTypePicker
                    onSelect={(type) => {
                      onAddField(type);
                      setShowFieldPicker(false);
                    }}
                    onClose={() => setShowFieldPicker(false)}
                  />
                )}
              </div>
            </div>

            {section.fields.length === 0 ? (
              <p className="text-sm text-foreground-tertiary text-center py-4">
                No fields yet. Add fields to collect data.
              </p>
            ) : (
              <div className="space-y-2">
                {section.fields.map((field, fieldIndex) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    fieldIndex={fieldIndex}
                    totalFields={section.fields.length}
                    isEditing={editingField === field.id}
                    onUpdate={(updates) => onUpdateField(field.id, updates)}
                    onDelete={() => onDeleteField(field.id)}
                    onMoveUp={() => onMoveFieldUp(fieldIndex)}
                    onMoveDown={() => onMoveFieldDown(fieldIndex)}
                    onEdit={() => onEditField(field.id)}
                    onCloseEdit={() => onEditField(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Field Type Picker Component
interface FieldTypePickerProps {
  onSelect: (type: FormFieldType) => void;
  onClose: () => void;
}

function FieldTypePicker({ onSelect, onClose }: FieldTypePickerProps) {
  const fieldTypes: FormFieldType[] = [
    "TEXT_SHORT",
    "TEXT_LONG",
    "NUMBER",
    "YES_NO",
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "DATE",
    "TIME",
    "DATETIME",
    "RATING_SCALE",
    "SIGNATURE",
    "PHOTO",
  ];

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-lg shadow-lg z-20 py-1">
        {fieldTypes.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary"
          >
            {FIELD_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </>
  );
}

// Field Card Component
interface FieldCardProps {
  field: CarePlanTemplateFieldData;
  fieldIndex: number;
  totalFields: number;
  isEditing: boolean;
  onUpdate: (updates: Partial<CarePlanTemplateFieldData>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onCloseEdit: () => void;
}

function FieldCard({
  field,
  fieldIndex,
  totalFields,
  isEditing,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEdit,
  onCloseEdit,
}: FieldCardProps) {
  return (
    <div className="border border-border rounded p-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-foreground-tertiary" />
        <div className="flex-1">
          <Input
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="text-sm"
            placeholder="Field label"
          />
        </div>
        <Badge variant="default">{FIELD_TYPE_LABELS[field.type]}</Badge>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded border-border"
          />
          Required
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={fieldIndex === 0}
            className="p-1 text-foreground-tertiary hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={fieldIndex === totalFields - 1}
            className="p-1 text-foreground-tertiary hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-foreground-tertiary hover:text-foreground"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-foreground-tertiary hover:text-error"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Field Configuration */}
      {isEditing && (
        <FieldConfigEditor
          field={field}
          onUpdate={onUpdate}
          onClose={onCloseEdit}
        />
      )}
    </div>
  );
}

// Field Configuration Editor
interface FieldConfigEditorProps {
  field: CarePlanTemplateFieldData;
  onUpdate: (updates: Partial<CarePlanTemplateFieldData>) => void;
  onClose: () => void;
}

function FieldConfigEditor({ field, onUpdate, onClose }: FieldConfigEditorProps) {
  const config = field.config as Record<string, unknown>;

  const updateConfig = (key: string, value: unknown) => {
    onUpdate({ config: { ...config, [key]: value } });
  };

  const renderConfigFields = () => {
    switch (field.type) {
      case "TEXT_SHORT":
      case "TEXT_LONG":
        return (
          <div className="space-y-2">
            <Label>Max Length</Label>
            <Input
              type="number"
              value={(config.maxLength as number) || ""}
              onChange={(e) => updateConfig("maxLength", parseInt(e.target.value) || undefined)}
              placeholder="e.g., 255"
            />
          </div>
        );

      case "NUMBER":
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Min</Label>
              <Input
                type="number"
                value={(config.min as number) ?? ""}
                onChange={(e) => updateConfig("min", e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label>Max</Label>
              <Input
                type="number"
                value={(config.max as number) ?? ""}
                onChange={(e) => updateConfig("max", e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Input
                value={(config.unit as string) || ""}
                onChange={(e) => updateConfig("unit", e.target.value || undefined)}
                placeholder="e.g., hours"
              />
            </div>
          </div>
        );

      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
        return (
          <ChoiceOptionsEditor
            options={(config.options as ChoiceOption[]) || []}
            onChange={(options) => updateConfig("options", options)}
          />
        );

      case "RATING_SCALE":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Min Value</Label>
              <Input
                type="number"
                value={(config.min as number) ?? 1}
                onChange={(e) => updateConfig("min", parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label>Max Value</Label>
              <Input
                type="number"
                value={(config.max as number) ?? 5}
                onChange={(e) => updateConfig("max", parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase text-foreground-tertiary">Field Settings</Label>
        <button onClick={onClose} className="text-foreground-tertiary hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      {renderConfigFields()}
    </div>
  );
}

// Choice Options Editor
interface ChoiceOptionsEditorProps {
  options: ChoiceOption[];
  onChange: (options: ChoiceOption[]) => void;
}

function ChoiceOptionsEditor({ options, onChange }: ChoiceOptionsEditorProps) {
  const addOption = () => {
    onChange([...options, { value: `option_${options.length + 1}`, label: `Option ${options.length + 1}` }]);
  };

  const updateOption = (index: number, updates: Partial<ChoiceOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Options</Label>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={option.label}
            onChange={(e) => updateOption(index, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
            placeholder="Option label"
            className="flex-1"
          />
          <button
            onClick={() => removeOption(index)}
            className="p-1 text-foreground-tertiary hover:text-error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <Button size="sm" variant="secondary" onClick={addOption}>
        <Plus className="w-3 h-3 mr-1" />
        Add Option
      </Button>
    </div>
  );
}

export default TemplateBuilder;
