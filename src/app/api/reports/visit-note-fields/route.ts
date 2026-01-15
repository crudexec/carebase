import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { FormFieldType } from "@prisma/client";

const fieldReportQuerySchema = z.object({
  templateId: z.string(),
  fieldId: z.string().optional(), // Specific field to aggregate
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().optional(),
  carerId: z.string().optional(),
});

interface FormSchemaSnapshot {
  sections: Array<{
    id: string;
    title: string;
    fields: Array<{
      id: string;
      label: string;
      type: FormFieldType;
      config?: Record<string, unknown>;
    }>;
  }>;
}

// GET /api/reports/visit-note-fields - Aggregate visit note field data
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = fieldReportQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { templateId, fieldId, startDate, endDate, clientId, carerId } =
      queryValidation.data;

    // Get the template to understand its structure
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        companyId: session.user.companyId,
      },
      include: {
        sections: {
          include: {
            fields: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Build where clause for visit notes
    const where = {
      companyId: session.user.companyId,
      templateId,
      ...(clientId ? { clientId } : {}),
      ...(carerId ? { carerId } : {}),
      ...(startDate || endDate
        ? {
            submittedAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    // Fetch visit notes
    const visitNotes = await prisma.visitNote.findMany({
      where,
      select: {
        id: true,
        data: true,
        formSchemaSnapshot: true,
        submittedAt: true,
        client: { select: { firstName: true, lastName: true } },
        carer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Get all fields from the template
    const allFields = template.sections.flatMap((s) =>
      s.fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        sectionTitle: s.title,
        config: f.config as Record<string, unknown> | null,
      }))
    );

    // If specific field requested, aggregate that field
    if (fieldId) {
      const field = allFields.find((f) => f.id === fieldId);
      if (!field) {
        return NextResponse.json(
          { error: "Field not found in template" },
          { status: 404 }
        );
      }

      const fieldReport = aggregateFieldData(visitNotes, field);
      return NextResponse.json({
        template: { id: template.id, name: template.name },
        field,
        totalResponses: visitNotes.length,
        aggregation: fieldReport,
      });
    }

    // Otherwise return aggregation for all aggregatable fields
    const fieldReports = allFields
      .filter((f) => isAggregatableField(f.type))
      .map((field) => ({
        field,
        aggregation: aggregateFieldData(visitNotes, field),
      }));

    return NextResponse.json({
      template: { id: template.id, name: template.name },
      totalResponses: visitNotes.length,
      fields: fieldReports,
      availableFields: allFields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        sectionTitle: f.sectionTitle,
      })),
    });
  } catch (error) {
    console.error("Error generating field report:", error);
    return NextResponse.json(
      { error: "Failed to generate field report" },
      { status: 500 }
    );
  }
}

function isAggregatableField(type: FormFieldType): boolean {
  return [
    "YES_NO",
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "RATING_SCALE",
    "NUMBER",
  ].includes(type);
}

function aggregateFieldData(
  visitNotes: Array<{
    id: string;
    data: unknown;
    formSchemaSnapshot: unknown;
    submittedAt: Date;
  }>,
  field: {
    id: string;
    label: string;
    type: FormFieldType;
    config?: Record<string, unknown> | null;
  }
) {
  const values: Array<{ value: unknown; submittedAt: Date }> = [];

  for (const note of visitNotes) {
    const data = note.data as Record<string, unknown>;
    if (data && data[field.id] !== undefined) {
      values.push({ value: data[field.id], submittedAt: note.submittedAt });
    }
  }

  const totalResponses = values.length;

  switch (field.type) {
    case "YES_NO": {
      const yesCount = values.filter((v) => v.value === true).length;
      const noCount = values.filter((v) => v.value === false).length;
      return {
        type: "yes_no",
        yes: yesCount,
        no: noCount,
        yesPercentage:
          totalResponses > 0
            ? Math.round((yesCount / totalResponses) * 100)
            : 0,
        noPercentage:
          totalResponses > 0 ? Math.round((noCount / totalResponses) * 100) : 0,
      };
    }

    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE": {
      const options = (field.config?.options as string[]) || [];
      const counts: Record<string, number> = {};

      for (const opt of options) {
        counts[opt] = 0;
      }

      for (const v of values) {
        if (field.type === "MULTIPLE_CHOICE" && Array.isArray(v.value)) {
          for (const selected of v.value as string[]) {
            if (counts[selected] !== undefined) {
              counts[selected]++;
            }
          }
        } else if (typeof v.value === "string") {
          if (counts[v.value] !== undefined) {
            counts[v.value]++;
          }
        }
      }

      return {
        type: "choice",
        options: Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage:
            totalResponses > 0
              ? Math.round((count / totalResponses) * 100)
              : 0,
        })),
      };
    }

    case "RATING_SCALE": {
      const numericValues = values
        .map((v) => Number(v.value))
        .filter((n) => !isNaN(n));

      const maxRating = (field.config?.max as number) || 5;
      const distribution: Record<number, number> = {};
      for (let i = 1; i <= maxRating; i++) {
        distribution[i] = 0;
      }

      for (const n of numericValues) {
        if (distribution[n] !== undefined) {
          distribution[n]++;
        }
      }

      const average =
        numericValues.length > 0
          ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          : 0;

      return {
        type: "rating",
        average: Math.round(average * 10) / 10,
        maxRating,
        distribution: Object.entries(distribution).map(([rating, count]) => ({
          rating: Number(rating),
          count,
        })),
        totalRatings: numericValues.length,
      };
    }

    case "NUMBER": {
      const numericValues = values
        .map((v) => Number(v.value))
        .filter((n) => !isNaN(n));

      if (numericValues.length === 0) {
        return {
          type: "number",
          count: 0,
          sum: 0,
          average: 0,
          min: 0,
          max: 0,
        };
      }

      const sum = numericValues.reduce((a, b) => a + b, 0);
      const average = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);

      return {
        type: "number",
        count: numericValues.length,
        sum: Math.round(sum * 100) / 100,
        average: Math.round(average * 100) / 100,
        min,
        max,
      };
    }

    default:
      return {
        type: "text",
        totalResponses,
        sample: values.slice(0, 5).map((v) => String(v.value)),
      };
  }
}
