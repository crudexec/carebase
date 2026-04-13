import { Prisma } from "@prisma/client";
import {
  AssessmentTemplateData,
  AssessmentTemplateSnapshot,
} from "@/lib/assessments/types";

type TemplateWithSections = {
  id: string;
  name: string;
  description: string | null;
  version: number;
  scoringMethod: string;
  maxScore: Prisma.Decimal | number | null;
  passingScore: Prisma.Decimal | number | null;
  scoringThresholds: Prisma.JsonValue | null;
  sections: Array<{
    id: string;
    sectionType: string;
    title: string;
    description: string | null;
    instructions: string | null;
    displayOrder: number;
    scoringMethod: string | null;
    maxScore: Prisma.Decimal | number | null;
    weight: Prisma.Decimal | number | null;
    items: Array<{
      id: string;
      code: string;
      question: string;
      description: string | null;
      responseType: string;
      isRequired: boolean;
      displayOrder: number;
      responseOptions: Prisma.JsonValue | null;
      minValue: number | null;
      maxValue: number | null;
      scoreMapping: Prisma.JsonValue | null;
      showIf: Prisma.JsonValue | null;
    }>;
  }>;
};

function toNumber(value: Prisma.Decimal | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === "number" ? value : Number(value);
}

export function buildAssessmentTemplateSnapshot(
  template: TemplateWithSections
): AssessmentTemplateSnapshot {
  return {
    templateId: template.id,
    templateName: template.name,
    description: template.description || undefined,
    version: template.version,
    scoringConfig: {
      method: template.scoringMethod as AssessmentTemplateSnapshot["scoringConfig"]["method"],
      maxScore: toNumber(template.maxScore),
      passingScore: toNumber(template.passingScore),
      thresholds: (template.scoringThresholds as AssessmentTemplateSnapshot["scoringConfig"]["thresholds"]) || undefined,
    },
    sections: template.sections.map((section) => ({
      id: section.id,
      sectionType: section.sectionType as AssessmentTemplateSnapshot["sections"][number]["sectionType"],
      title: section.title,
      description: section.description || undefined,
      instructions: section.instructions || undefined,
      order: section.displayOrder,
      scoringConfig: section.scoringMethod
        ? {
            method: section.scoringMethod as AssessmentTemplateSnapshot["sections"][number]["scoringConfig"]["method"],
            maxScore: toNumber(section.maxScore),
            weight: toNumber(section.weight),
          }
        : undefined,
      items: section.items.map((item) => ({
        id: item.id,
        code: item.code,
        questionText: item.question,
        description: item.description || undefined,
        responseType: item.responseType as AssessmentTemplateSnapshot["sections"][number]["items"][number]["responseType"],
        required: item.isRequired,
        order: item.displayOrder,
        responseOptions: item.responseOptions || undefined,
        minValue: item.minValue ?? undefined,
        maxValue: item.maxValue ?? undefined,
        scoreMapping: (item.scoreMapping as Record<string, number> | null) || undefined,
        showIf: (item.showIf as AssessmentTemplateSnapshot["sections"][number]["items"][number]["showIf"]) || undefined,
      })),
    })),
  };
}

export function parseAssessmentTemplateSnapshot(
  snapshot: Prisma.JsonValue | null | undefined
): AssessmentTemplateSnapshot | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }

  return snapshot as unknown as AssessmentTemplateSnapshot;
}

export function snapshotToTemplateData(
  snapshot: AssessmentTemplateSnapshot
): AssessmentTemplateData {
  return {
    id: snapshot.templateId,
    name: snapshot.templateName,
    description: snapshot.description,
    status: "ACTIVE",
    version: snapshot.version,
    isRequired: false,
    scoringConfig: snapshot.scoringConfig,
    sections: snapshot.sections.map((section) => ({
      id: section.id,
      sectionType: section.sectionType,
      title: section.title,
      description: section.description,
      instructions: section.instructions,
      order: section.order,
      scoringConfig: section.scoringConfig,
      items: section.items.map((item) => ({
        id: item.id,
        code: item.code,
        questionText: item.questionText,
        description: item.description,
        responseType: item.responseType,
        required: item.required,
        order: item.order,
        responseOptions: item.responseOptions as AssessmentTemplateData["sections"][number]["items"][number]["responseOptions"],
        minValue: item.minValue,
        maxValue: item.maxValue,
        scoreMapping: item.scoreMapping,
        showIf: item.showIf,
      })),
    })),
  };
}

export function snapshotToRenderedTemplate(
  snapshot: AssessmentTemplateSnapshot
) {
  return {
    id: snapshot.templateId,
    name: snapshot.templateName,
    description: snapshot.description || null,
    version: snapshot.version,
    maxScore: snapshot.scoringConfig.maxScore ?? null,
    sections: snapshot.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description || null,
      sectionType: section.sectionType,
      displayOrder: section.order,
      items: section.items.map((item) => ({
        id: item.id,
        code: item.code,
        question: item.questionText,
        description: item.description || null,
        responseType: item.responseType,
        responseOptions: item.responseOptions ?? null,
        minValue: item.minValue ?? null,
        maxValue: item.maxValue ?? null,
        isRequired: item.required,
        displayOrder: item.order,
      })),
    })),
  };
}
