import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const generateSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  intakeId: z.string().optional(),
});

interface AssessmentData {
  code: string;
  totalScore: number | null;
  maxScore: number | null;
}

// Care task templates based on assessment scores
function generateTasksFromAssessments(assessments: AssessmentData[]): {
  taskType: string;
  description: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}[] {
  const tasks: {
    taskType: string;
    description: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }[] = [];

  for (const assessment of assessments) {
    const score = assessment.totalScore ?? 0;
    const maxScore = assessment.maxScore ?? 6;
    const percentage = (score / maxScore) * 100;

    switch (assessment.code) {
      case "KATZ_ADL":
        // ADL assessment - lower scores = more needs
        if (score <= 2) {
          // Severe impairment - full assistance
          tasks.push(
            {
              taskType: "BATHING",
              description: "Full bathing assistance",
              frequency: "Daily",
              duration: "30 minutes",
              instructions: "Complete bed bath or assist with shower. Ensure safety rails are used.",
            },
            {
              taskType: "DRESSING",
              description: "Full dressing assistance",
              frequency: "Daily",
              duration: "20 minutes",
              instructions: "Assist with all aspects of dressing including undergarments, outer wear, and footwear.",
            },
            {
              taskType: "TOILETING",
              description: "Full toileting assistance",
              frequency: "As needed",
              duration: "15 minutes each",
              instructions: "Assist with toileting, incontinence care if needed, and hygiene.",
            },
            {
              taskType: "TRANSFERRING",
              description: "Two-person transfer assistance",
              frequency: "As needed",
              instructions: "Use gait belt and proper body mechanics. Two-person assist required.",
            },
            {
              taskType: "FEEDING",
              description: "Feeding assistance",
              frequency: "3 times daily",
              duration: "30 minutes each meal",
              instructions: "Assist with meal preparation and feeding. Monitor for choking hazards.",
            }
          );
        } else if (score <= 4) {
          // Moderate impairment - some assistance
          tasks.push(
            {
              taskType: "BATHING",
              description: "Bathing supervision and assistance",
              frequency: "Daily",
              duration: "20 minutes",
              instructions: "Supervise and assist as needed with bathing. Client can perform some tasks independently.",
            },
            {
              taskType: "DRESSING",
              description: "Dressing assistance with difficult items",
              frequency: "Daily",
              duration: "15 minutes",
              instructions: "Assist with buttons, zippers, and shoes. Encourage independence where possible.",
            },
            {
              taskType: "TOILETING",
              description: "Toileting standby assistance",
              frequency: "As needed",
              instructions: "Provide standby assistance and verbal cues. Ensure bathroom safety.",
            }
          );
        } else {
          // Mild or no impairment - supervision only
          tasks.push(
            {
              taskType: "SUPERVISION",
              description: "General ADL supervision",
              frequency: "Daily",
              instructions: "Monitor ADL activities and provide assistance only when requested.",
            }
          );
        }
        break;

      case "LAWTON_IADL":
        // IADL assessment - lower scores = more needs
        if (score <= 4) {
          // Significant IADL impairment
          tasks.push(
            {
              taskType: "MEAL_PREP",
              description: "Meal preparation",
              frequency: "Daily",
              duration: "45 minutes",
              instructions: "Prepare nutritious meals following dietary restrictions. Ensure food safety.",
            },
            {
              taskType: "HOUSEKEEPING",
              description: "Light housekeeping",
              frequency: "3 times weekly",
              duration: "1 hour",
              instructions: "Vacuuming, dusting, bathroom cleaning, kitchen cleaning, and laundry.",
            },
            {
              taskType: "MEDICATION",
              description: "Medication reminders",
              frequency: "Daily",
              instructions: "Remind client to take medications as scheduled. Do not administer medications.",
            },
            {
              taskType: "SHOPPING",
              description: "Grocery shopping assistance",
              frequency: "Weekly",
              instructions: "Accompany client or shop for essential items based on list.",
            }
          );
        } else if (score <= 6) {
          // Moderate IADL impairment
          tasks.push(
            {
              taskType: "MEAL_PREP",
              description: "Meal preparation assistance",
              frequency: "Daily",
              instructions: "Assist with complex meal tasks. Client can handle simple preparations.",
            },
            {
              taskType: "HOUSEKEEPING",
              description: "Heavy housekeeping assistance",
              frequency: "Weekly",
              duration: "1 hour",
              instructions: "Assist with tasks requiring physical effort like vacuuming and mopping.",
            }
          );
        }
        break;

      case "PHQ9":
        // Depression screening - higher scores = more severe
        if (score >= 15) {
          // Moderately severe to severe depression
          tasks.push(
            {
              taskType: "COMPANIONSHIP",
              description: "Active companionship and engagement",
              frequency: "Daily",
              duration: "2 hours",
              instructions: "Engage client in conversation, activities, and encourage social interaction. Report any suicidal ideation immediately.",
            },
            {
              taskType: "MONITORING",
              description: "Mental health monitoring",
              frequency: "Daily",
              instructions: "Monitor mood, appetite, and sleep patterns. Document and report changes to care coordinator.",
            }
          );
        } else if (score >= 10) {
          // Moderate depression
          tasks.push(
            {
              taskType: "COMPANIONSHIP",
              description: "Companionship and social engagement",
              frequency: "Daily",
              duration: "1 hour",
              instructions: "Provide companionship and encourage participation in enjoyable activities.",
            }
          );
        }
        break;

      case "MINI_COG":
        // Cognitive screening - lower scores = positive screen for dementia
        if (score <= 2) {
          // Positive screen for cognitive impairment
          tasks.push(
            {
              taskType: "SUPERVISION",
              description: "Safety supervision",
              frequency: "Continuous during visits",
              instructions: "Never leave client unattended. Monitor for wandering, falls, and unsafe behaviors.",
            },
            {
              taskType: "CUEING",
              description: "Verbal cueing and redirection",
              frequency: "As needed",
              instructions: "Provide step-by-step verbal cues for all activities. Use calm, simple language.",
            },
            {
              taskType: "MEDICATION",
              description: "Medication supervision",
              frequency: "Daily",
              instructions: "Directly supervise all medication administration. Verify correct medication and dosage.",
            }
          );
        }
        break;
    }
  }

  // Always add basic companionship if no other companionship task
  if (!tasks.some(t => t.taskType === "COMPANIONSHIP")) {
    tasks.push({
      taskType: "COMPANIONSHIP",
      description: "Companionship and social support",
      frequency: "Each visit",
      instructions: "Provide friendly conversation and emotional support.",
    });
  }

  return tasks;
}

// POST /api/care-plans/generate - Generate care plan from assessments
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { clientId, intakeId } = validation.data;

    // Verify client exists
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get completed assessments for this client/intake
    const whereClause: Record<string, unknown> = {
      clientId,
      status: "COMPLETED",
      companyId: session.user.companyId,
    };

    if (intakeId) {
      whereClause.intakeId = intakeId;
    }

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            name: true,
            maxScore: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    if (assessments.length === 0) {
      return NextResponse.json(
        { error: "No completed assessments found for this client" },
        { status: 400 }
      );
    }

    // Generate tasks based on assessment scores
    // Use template name to derive the code for task generation
    const assessmentData: AssessmentData[] = assessments.map((a) => ({
      code: a.template.name.toUpperCase().replace(/\s+/g, "_"),
      totalScore: a.totalScore ? Number(a.totalScore) : null,
      maxScore: a.template.maxScore ? Number(a.template.maxScore) : null,
    }));

    const generatedTasks = generateTasksFromAssessments(assessmentData);

    // Calculate recommended weekly hours based on task count and frequency
    let weeklyHours = 0;
    for (const task of generatedTasks) {
      const durationMinutes = task.duration
        ? parseInt(task.duration) || 30
        : 30;

      switch (task.frequency.toLowerCase()) {
        case "daily":
          weeklyHours += (durationMinutes / 60) * 7;
          break;
        case "3 times daily":
          weeklyHours += (durationMinutes / 60) * 3 * 7;
          break;
        case "3 times weekly":
          weeklyHours += (durationMinutes / 60) * 3;
          break;
        case "weekly":
          weeklyHours += durationMinutes / 60;
          break;
        default:
          weeklyHours += durationMinutes / 60; // Default to once
      }
    }

    // Round to nearest 0.5
    weeklyHours = Math.ceil(weeklyHours * 2) / 2;

    // Create care plan
    const carePlan = await prisma.carePlan.create({
      data: {
        companyId: session.user.companyId,
        clientId,
        intakeId,
        createdById: session.user.id,
        planNumber: `CP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        status: "DRAFT",
        effectiveDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        recommendedHours: weeklyHours,
        summary: `Based on assessment scores, this care plan addresses ${assessments.length} completed assessment(s) and includes ${generatedTasks.length} care task(s).`,
        taskTemplates: {
          create: generatedTasks.map((task, index) => ({
            taskName: task.description,
            taskDescription: task.instructions,
            category: task.taskType,
            frequency: task.frequency,
            duration: task.duration ? parseInt(task.duration.replace(/\D/g, ""), 10) || null : null,
            displayOrder: index + 1,
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        taskTemplates: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CARE_PLAN_GENERATED",
        entityType: "CarePlan",
        entityId: carePlan.id,
        changes: {
          clientName: `${client.firstName} ${client.lastName}`,
          assessmentCount: assessments.length,
          taskCount: generatedTasks.length,
          weeklyHours,
        },
      },
    });

    return NextResponse.json({
      carePlan,
      generatedFrom: assessments.map((a) => ({
        name: a.template.name,
        score: a.totalScore,
        maxScore: a.template.maxScore,
      })),
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating care plan:", error);
    return NextResponse.json(
      { error: "Failed to generate care plan" },
      { status: 500 }
    );
  }
}
