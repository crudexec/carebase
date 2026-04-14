import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  parseAssessmentTemplateSnapshot,
  snapshotToTemplateData,
} from "@/lib/assessments/snapshots";
import { calculateAssessmentScore } from "@/lib/assessments/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get interpretation based on score and template
function getScoreInterpretation(
  templateName: string,
  totalScore: number
): string {
  // Normalize template name for matching
  const normalizedName = templateName.toUpperCase().replace(/\s+/g, "_");

  // Standard interpretations for common assessments
  const interpretations: Record<string, { ranges: { max: number; label: string }[] }> = {
    KATZ_ADL: {
      ranges: [
        { max: 2, label: "Severe functional impairment - Full assistance required" },
        { max: 4, label: "Moderate functional impairment - Significant assistance needed" },
        { max: 5, label: "Mild functional impairment - Some assistance needed" },
        { max: 6, label: "Full function - Independent in all activities" },
      ],
    },
    LAWTON_IADL: {
      ranges: [
        { max: 2, label: "Severe impairment - Unable to perform most IADLs" },
        { max: 4, label: "Moderate-severe impairment - Needs significant support" },
        { max: 6, label: "Moderate impairment - Needs some support" },
        { max: 7, label: "Mild impairment - Mostly independent" },
        { max: 8, label: "High function - Independent in all IADLs" },
      ],
    },
    PHQ9: {
      ranges: [
        { max: 4, label: "Minimal depression - Monitoring recommended" },
        { max: 9, label: "Mild depression - Watchful waiting, supportive counseling" },
        { max: 14, label: "Moderate depression - Consider treatment plan" },
        { max: 19, label: "Moderately severe depression - Active treatment recommended" },
        { max: 27, label: "Severe depression - Immediate intervention, possible referral" },
      ],
    },
    MINI_COG: {
      ranges: [
        { max: 2, label: "Positive screen for dementia - Further evaluation needed" },
        { max: 5, label: "Negative screen - No significant cognitive impairment" },
      ],
    },
  };

  // Find matching interpretation by checking if template name contains key terms
  let templateInterpretation = null;
  for (const [key, value] of Object.entries(interpretations)) {
    if (normalizedName.includes(key) || normalizedName.includes(key.replace("_", ""))) {
      templateInterpretation = value;
      break;
    }
  }

  if (!templateInterpretation) {
    return `Score: ${totalScore}`;
  }

  for (const range of templateInterpretation.ranges) {
    if (totalScore <= range.max) {
      return range.label;
    }
  }

  return `Score: ${totalScore}`;
}

// POST /api/assessments/[id]/complete - Complete assessment and calculate scores
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get assessment with template and responses
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: {
          include: {
            sections: {
              include: {
                items: true,
              },
            },
          },
        },
        responses: {
          include: {
            item: true,
          },
        },
        client: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment is already completed" },
        { status: 400 }
      );
    }

    const snapshot = parseAssessmentTemplateSnapshot(
      assessment.formSchemaSnapshot as Prisma.JsonValue | null
    );
    const templateData = snapshot
      ? snapshotToTemplateData(snapshot)
      : {
          id: assessment.template.id,
          name: assessment.template.name,
          description: assessment.template.description || undefined,
          status: "ACTIVE" as const,
          version: assessment.template.version,
          isRequired: false,
          scoringConfig: {
            method: assessment.template.scoringMethod,
            maxScore: assessment.template.maxScore
              ? Number(assessment.template.maxScore)
              : undefined,
            passingScore: assessment.template.passingScore
              ? Number(assessment.template.passingScore)
              : undefined,
            thresholds: (assessment.template.scoringThresholds as Record<string, number> | undefined) || undefined,
          },
          sections: assessment.template.sections.map((section) => ({
            id: section.id,
            sectionType: section.sectionType,
            title: section.title,
            description: section.description || undefined,
            instructions: section.instructions || undefined,
            order: section.displayOrder,
            scoringConfig: section.scoringMethod
              ? {
                  method: section.scoringMethod,
                  maxScore: section.maxScore ? Number(section.maxScore) : undefined,
                  weight: section.weight ? Number(section.weight) : undefined,
                }
              : undefined,
            items: section.items.map((item) => ({
              id: item.id,
              code: item.code,
              questionText: item.question,
              description: item.description || undefined,
              responseType: item.responseType,
              required: item.isRequired,
              order: item.displayOrder,
              responseOptions: item.responseOptions as { value: string; label: string; score?: number }[] | undefined,
              minValue: item.minValue ?? undefined,
              maxValue: item.maxValue ?? undefined,
              scoreMapping: item.scoreMapping as Record<string, number> | undefined,
            })),
          })),
        };

    // Check if all required items have responses
    const requiredItems = templateData.sections.flatMap((s) =>
      s.items.filter((i) => i.required)
    );

    const respondedItemIds = new Set(assessment.responses.map((r) => r.itemId));
    const missingRequired = requiredItems.filter(
      (item) => !respondedItemIds.has(item.id)
    );

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required responses",
          missingItems: missingRequired.map((i) => ({
            id: i.id,
            question: i.questionText,
          })),
        },
        { status: 400 }
      );
    }

    // Calculate scores
    const scoreResult = calculateAssessmentScore(
      assessment.responses.map((response) => ({
        itemId: response.itemId,
        value:
          response.valueJson ??
          response.valueText ??
          response.valueNumber?.toNumber() ??
          response.valueBoolean ??
          response.valueDate ??
          null,
      })),
      templateData.sections.flatMap((section) =>
        section.items.map((item) => ({
          id: item.id,
          responseType: item.responseType,
          scoreMapping: item.scoreMapping ?? null,
          responseOptions: Array.isArray(item.responseOptions)
            ? item.responseOptions.map((option) => ({
                value: String(option.value),
                score: option.score,
              }))
            : null,
        }))
      ),
      templateData.scoringConfig.method
    );
    const totalScore = scoreResult.totalScore;
    const percentageScore = templateData.scoringConfig.maxScore
      ? (totalScore / templateData.scoringConfig.maxScore) * 100
      : null;

    // Get interpretation
    const interpretation = getScoreInterpretation(
      templateData.name,
      totalScore
    );

    // Update assessment
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        totalScore,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            maxScore: true,
          },
        },
        responses: {
          include: {
            item: {
              select: {
                id: true,
                question: true,
                code: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "ASSESSMENT_COMPLETED",
        entityType: "Assessment",
        entityId: assessment.id,
        changes: {
          templateName: templateData.name,
          templateVersion: assessment.templateVersion ?? templateData.version,
          clientName: `${assessment.client.firstName} ${assessment.client.lastName}`,
          totalScore,
          interpretation,
        },
      },
    });

    return NextResponse.json({
      assessment: updatedAssessment,
      scoring: {
        totalScore,
        percentageScore,
        maxScore: templateData.scoringConfig.maxScore ?? null,
        interpretation,
      },
    });
  } catch (error) {
    console.error("Error completing assessment:", error);
    return NextResponse.json(
      { error: "Failed to complete assessment" },
      { status: 500 }
    );
  }
}
