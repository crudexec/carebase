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
import { AssessmentSectionType, AssessmentResponseType, ScoringMethod } from "@prisma/client";
import {
  AssessmentTemplateData,
  AssessmentSectionData,
  AssessmentItemData,
  getDefaultResponseConfig,
  generateItemCode,
  SECTION_TYPE_LABELS,
  SECTION_TYPE_CATEGORIES,
  SCORING_METHOD_LABELS,
  SCORING_METHOD_DESCRIPTIONS,
} from "@/lib/assessments/types";
import { Button, Input, Label, Textarea, Select } from "@/components/ui";
import { Plus, X, Settings2 } from "lucide-react";
import { SectionItem, SectionItemOverlay } from "./section-item";
import { QuestionItemOverlay } from "./question-item";
import { QuestionEditor } from "./question-editor";
import { ResponseTypeSelector } from "./response-type-selector";

interface TemplateBuilderProps {
  template: AssessmentTemplateData;
  onChange: (template: AssessmentTemplateData) => void;
}

type DragItem =
  | { type: "section"; section: AssessmentSectionData }
  | { type: "item"; item: AssessmentItemData };

export function TemplateBuilder({ template, onChange }: TemplateBuilderProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(template.sections.map((s) => s.id))
  );
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = React.useState<string | null>(null);
  const [showSectionSelector, setShowSectionSelector] = React.useState(false);
  const [showScoringConfig, setShowScoringConfig] = React.useState(false);
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

  // Find the selected item
  const selectedItem = React.useMemo(() => {
    if (!selectedItemId) return null;
    for (const section of template.sections) {
      const item = section.items.find((i) => i.id === selectedItemId);
      if (item) return item;
    }
    return null;
  }, [selectedItemId, template.sections]);

  // Update template helper
  const updateTemplate = (updates: Partial<AssessmentTemplateData>) => {
    onChange({ ...template, ...updates });
  };

  // Section operations
  const addSection = (sectionType: AssessmentSectionType) => {
    const newSection: AssessmentSectionData = {
      id: `section-${Date.now()}`,
      sectionType,
      title: SECTION_TYPE_LABELS[sectionType],
      order: template.sections.length,
      items: [],
    };
    updateTemplate({ sections: [...template.sections, newSection] });
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
    setShowSectionSelector(false);
  };

  const updateSection = (sectionId: string, updates: Partial<AssessmentSectionData>) => {
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
    if (selectedItemId) {
      const sectionToDelete = template.sections.find((s) => s.id === sectionId);
      if (sectionToDelete?.items.some((i) => i.id === selectedItemId)) {
        setSelectedItemId(null);
      }
    }
  };

  // Item operations
  const addItem = (sectionId: string, responseType: AssessmentResponseType) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const config = getDefaultResponseConfig(responseType);
    const newItem: AssessmentItemData = {
      id: `item-${Date.now()}`,
      code: generateItemCode(section.sectionType, section.items.length),
      questionText: "New Question",
      responseType,
      required: true,
      order: section.items.length,
      responseOptions: config && "options" in config ? config.options : undefined,
      minValue: config && "minValue" in config ? config.minValue : undefined,
      maxValue: config && "maxValue" in config ? config.maxValue : undefined,
    };

    updateTemplate({
      sections: template.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      ),
    });
    setSelectedItemId(newItem.id);
    setShowItemSelector(null);
  };

  const updateItem = (itemId: string, updates: Partial<AssessmentItemData>) => {
    updateTemplate({
      sections: template.sections.map((section) => ({
        ...section,
        items: section.items.map((i) =>
          i.id === itemId ? { ...i, ...updates } : i
        ),
      })),
    });
  };

  const deleteItem = (itemId: string) => {
    updateTemplate({
      sections: template.sections.map((section) => ({
        ...section,
        items: section.items.filter((i) => i.id !== itemId),
      })),
    });
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
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

    // Check if it's an item
    for (const s of template.sections) {
      const item = s.items.find((i) => i.id === activeId);
      if (item) {
        setActiveDragItem({ type: "item", item });
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

    // Check if we're moving items within a section
    for (const section of template.sections) {
      const activeItemIndex = section.items.findIndex((i) => i.id === activeId);
      const overItemIndex = section.items.findIndex((i) => i.id === overId);

      if (activeItemIndex !== -1 && overItemIndex !== -1) {
        const newItems = arrayMove(section.items, activeItemIndex, overItemIndex).map(
          (i, idx) => ({ ...i, order: idx })
        );
        updateSection(section.id, { items: newItems });
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
              placeholder="e.g., Maryland CFC Initial Assessment"
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
              placeholder="Describe what this assessment is used for"
              rows={2}
            />
          </div>

          {/* Scoring config toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowScoringConfig(!showScoringConfig)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            {showScoringConfig ? "Hide" : "Show"} Scoring Configuration
          </Button>

          {showScoringConfig && (
            <ScoringConfigEditor
              config={template.scoringConfig}
              onChange={(scoringConfig) => updateTemplate({ scoringConfig })}
            />
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sections</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSectionSelector(true)}>
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
                        selectedItemId={selectedItemId}
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
                        onSelectItem={setSelectedItemId}
                        onAddItem={() => setShowItemSelector(section.id)}
                        onUpdateItem={updateItem}
                        onDeleteItem={deleteItem}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-foreground-secondary">
                    No sections yet. Add a section to start building your assessment.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSectionSelector(true)}
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
              {activeDragItem?.type === "item" && (
                <QuestionItemOverlay item={activeDragItem.item} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Section type selector modal */}
      {showSectionSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSectionSelector(false)}
        >
          <div
            className="max-h-[80vh] w-[600px] overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Section</h3>
              <button
                type="button"
                onClick={() => setShowSectionSelector(false)}
                className="rounded p-1 hover:bg-background-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SectionTypeSelector onSelect={addSection} />
          </div>
        </div>
      )}

      {/* Response type selector modal */}
      {showItemSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowItemSelector(null)}
        >
          <div
            className="max-h-[80vh] w-[500px] overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Question</h3>
              <button
                type="button"
                onClick={() => setShowItemSelector(null)}
                className="rounded p-1 hover:bg-background-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ResponseTypeSelector
              onSelect={(type) => addItem(showItemSelector, type)}
            />
          </div>
        </div>
      )}

      {/* Question editor panel */}
      {selectedItem && (
        <div className="w-96 border-l border-border bg-background">
          <QuestionEditor
            item={selectedItem}
            onChange={(updates) => updateItem(selectedItem.id, updates)}
            onClose={() => setSelectedItemId(null)}
            onDelete={() => deleteItem(selectedItem.id)}
          />
        </div>
      )}
    </div>
  );
}

// Section Type Selector Component
function SectionTypeSelector({ onSelect }: { onSelect: (type: AssessmentSectionType) => void }) {
  return (
    <div className="space-y-6">
      {Object.entries(SECTION_TYPE_CATEGORIES).map(([category, types]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-foreground-secondary mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type as AssessmentSectionType)}
                className="flex items-center gap-2 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-background-secondary"
              >
                <span className="text-sm">{SECTION_TYPE_LABELS[type as AssessmentSectionType]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Scoring Config Editor Component
function ScoringConfigEditor({
  config,
  onChange,
}: {
  config: AssessmentTemplateData["scoringConfig"];
  onChange: (config: AssessmentTemplateData["scoringConfig"]) => void;
}) {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-background-secondary">
      <h4 className="font-medium">Scoring Configuration</h4>

      <div className="space-y-2">
        <Label htmlFor="scoring-method">Scoring Method</Label>
        <Select
          id="scoring-method"
          value={config.method}
          onChange={(e) => onChange({ ...config, method: e.target.value as ScoringMethod })}
        >
          {Object.values(ScoringMethod).map((method) => (
            <option key={method} value={method}>
              {SCORING_METHOD_LABELS[method]}
            </option>
          ))}
        </Select>
        <p className="text-xs text-foreground-tertiary">
          {SCORING_METHOD_DESCRIPTIONS[config.method]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max-score">Maximum Score (optional)</Label>
          <Input
            id="max-score"
            type="number"
            value={config.maxScore ?? ""}
            onChange={(e) =>
              onChange({
                ...config,
                maxScore: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="Auto-calculated"
          />
        </div>
        {config.method === "THRESHOLD" && (
          <div className="space-y-2">
            <Label htmlFor="passing-score">Passing Score</Label>
            <Input
              id="passing-score"
              type="number"
              value={config.passingScore ?? ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  passingScore: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="Minimum to pass"
            />
          </div>
        )}
      </div>

      {/* Care Level Thresholds */}
      <div className="space-y-2">
        <Label>Care Level Thresholds (optional)</Label>
        <p className="text-xs text-foreground-tertiary">
          Define score ranges for care level determination
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Low (min score)</Label>
            <Input
              type="number"
              value={config.thresholds?.low ?? ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  thresholds: {
                    ...config.thresholds,
                    low: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Medium (min score)</Label>
            <Input
              type="number"
              value={config.thresholds?.medium ?? ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  thresholds: {
                    ...config.thresholds,
                    medium: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              placeholder="10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">High (min score)</Label>
            <Input
              type="number"
              value={config.thresholds?.high ?? ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  thresholds: {
                    ...config.thresholds,
                    high: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              placeholder="20"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Skilled (min score)</Label>
            <Input
              type="number"
              value={config.thresholds?.skilled ?? ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  thresholds: {
                    ...config.thresholds,
                    skilled: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              placeholder="30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
