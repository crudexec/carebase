import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Task analysis step from care plan
interface TaskAnalysisStepValue {
  stepId: string;
  stepName: string;
  baseline: string;
}

// Goal data structure from care plan
interface CarePlanGoal {
  goalSelection?: {
    goalAreaId?: string;
    goalAreaName?: string;
    targetSkillId?: string;
    targetSkillName?: string;
    objectiveId?: string;
    objectiveName?: string;
    selectedStepIds?: string[];
    selectedStepNames?: string[];
    taskAnalysisSteps?: TaskAnalysisStepValue[];
  };
  domain?: string;
  baseline?: string; // Current Skill Level
  target?: string; // Target Performance Level
  numberOfTrials?: string;
  frequency?: string;
  goalBackground?: string;
  goalStatement?: string;
  implementationProcedure?: string;
}

// Transformed goal for visit note
interface VisitNoteGoal {
  index: number;
  goalAreaName: string;
  targetSkillName: string;
  shortTermObjective: string;
  currentSkillLevel: string;
  targetPerformanceLevel: string;
  numberOfTrials: string;
  frequency: string;
  goalBackground: string;
  goalStatement: string;
  implementationProcedure: string;
  steps: Array<{ id: string; name: string }>;
}

// GET /api/visit-notes/goals?carePlanId=xxx
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carePlanId = searchParams.get("carePlanId");

    if (!carePlanId) {
      return NextResponse.json(
        { error: "carePlanId is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canViewNotes = hasPermission(user.role, PERMISSIONS.VISIT_NOTE_CREATE) ||
      hasPermission(user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL);

    if (!canViewNotes) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch care plan with form data
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id: carePlanId,
        companyId: user.companyId,
      },
      select: {
        id: true,
        planNumber: true,
        status: true,
        formData: true,
        formSchemaSnapshot: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    // Extract goals from form data
    const formData = carePlan.formData as Record<string, unknown> | null;
    const goals: VisitNoteGoal[] = [];

    if (formData) {
      // Find treatment goals field in form data
      // The key format is typically the field ID from the template
      for (const [, value] of Object.entries(formData)) {
        if (Array.isArray(value)) {
          // Check if this looks like treatment goals data
          const firstItem = value[0] as CarePlanGoal | undefined;
          if (firstItem && (firstItem.goalSelection || firstItem.goalStatement)) {
            // This is likely the treatment goals array
            value.forEach((goalData: CarePlanGoal, index: number) => {
              // Convert taskAnalysisSteps to the format expected by visit note
              const steps: Array<{ id: string; name: string }> = [];
              if (goalData.goalSelection?.taskAnalysisSteps) {
                goalData.goalSelection.taskAnalysisSteps.forEach((step) => {
                  steps.push({
                    id: step.stepId,
                    name: step.stepName,
                  });
                });
              }

              const goal: VisitNoteGoal = {
                index: index + 1,
                goalAreaName: goalData.goalSelection?.goalAreaName || "",
                targetSkillName: goalData.goalSelection?.targetSkillName || "",
                shortTermObjective: goalData.goalSelection?.objectiveName || goalData.goalSelection?.targetSkillName || "",
                currentSkillLevel: goalData.baseline || "",
                targetPerformanceLevel: goalData.target || "",
                numberOfTrials: goalData.numberOfTrials || "",
                frequency: goalData.frequency || "",
                goalBackground: goalData.goalBackground || "",
                goalStatement: goalData.goalStatement || "",
                implementationProcedure: goalData.implementationProcedure || "",
                steps: steps,
              };
              goals.push(goal);
            });
          }
        }
      }
    }

    return NextResponse.json({
      carePlan: {
        id: carePlan.id,
        planNumber: carePlan.planNumber,
        status: carePlan.status,
        client: carePlan.client,
      },
      goals,
    });
  } catch (error) {
    console.error("Error fetching care plan goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plan goals" },
      { status: 500 }
    );
  }
}
