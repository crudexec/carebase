import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { FormFieldType, Prisma } from "@prisma/client";

// Pre-defined starter templates
const STARTER_TEMPLATES = [
  {
    id: "basic-visit-notes",
    name: "Basic Visit Notes",
    description: "A simple form for documenting daily visit activities",
    sections: [
      {
        title: "Visit Summary",
        description: "General overview of the visit",
        fields: [
          {
            label: "What activities did you do with the client?",
            type: "TEXT_LONG" as FormFieldType,
            required: true,
            config: { maxLength: 2000, placeholder: "Describe the activities..." },
          },
          {
            label: "How was the client's mood today?",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: { options: ["Happy", "Neutral", "Sad", "Anxious", "Confused"] },
          },
          {
            label: "Any concerns or observations?",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: { maxLength: 1000, placeholder: "Note any concerns..." },
          },
        ],
      },
      {
        title: "Client Status",
        description: "Physical and health observations",
        fields: [
          {
            label: "Did the client eat/drink well?",
            type: "YES_NO" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Overall client condition rating",
            type: "RATING_SCALE" as FormFieldType,
            required: true,
            config: {
              min: 1,
              max: 5,
              labels: {
                1: "Poor",
                2: "Fair",
                3: "Good",
                4: "Very Good",
                5: "Excellent",
              },
            },
          },
        ],
      },
      {
        title: "Verification",
        description: undefined,
        fields: [
          {
            label: "Photo of completed tasks (optional)",
            type: "PHOTO" as FormFieldType,
            required: false,
            config: null,
          },
          {
            label: "Caregiver Signature",
            type: "SIGNATURE" as FormFieldType,
            required: true,
            config: null,
          },
        ],
      },
    ],
  },
  {
    id: "medication-check",
    name: "Medication Check",
    description: "Form for documenting medication administration",
    sections: [
      {
        title: "Medication Administration",
        description: undefined,
        fields: [
          {
            label: "Were all scheduled medications given?",
            type: "YES_NO" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Which medications were administered?",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Morning medications",
                "Afternoon medications",
                "Evening medications",
                "PRN medications",
                "Supplements",
              ],
            },
          },
          {
            label: "Time medications were given",
            type: "TIME" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Were there any issues or refusals?",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: { maxLength: 1000, placeholder: "Describe any issues..." },
          },
        ],
      },
      {
        title: "Client Response",
        description: undefined,
        fields: [
          {
            label: "How did the client respond to medication?",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: { options: ["No issues", "Minor discomfort", "Side effects noticed", "Refused medication"] },
          },
          {
            label: "Additional notes",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: { maxLength: 500 },
          },
          {
            label: "Caregiver Signature",
            type: "SIGNATURE" as FormFieldType,
            required: true,
            config: null,
          },
        ],
      },
    ],
  },
  {
    id: "personal-care",
    name: "Personal Care",
    description: "Form for documenting personal care assistance",
    sections: [
      {
        title: "Care Tasks Completed",
        description: "Select all tasks completed during this visit",
        fields: [
          {
            label: "Personal hygiene tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Bathing/showering",
                "Hair washing",
                "Oral care",
                "Shaving",
                "Nail care",
                "Dressing assistance",
              ],
            },
          },
          {
            label: "Mobility assistance",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Transfer assistance",
                "Walking support",
                "Wheelchair assistance",
                "Bed repositioning",
                "Exercise support",
              ],
            },
          },
        ],
      },
      {
        title: "Observations",
        description: undefined,
        fields: [
          {
            label: "Skin condition observations",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: { options: ["Normal", "Minor concerns", "Needs attention", "Reported to supervisor"] },
          },
          {
            label: "Mobility level",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: { options: ["Independent", "Minimal assistance", "Moderate assistance", "Full assistance"] },
          },
          {
            label: "Notes on care provided",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: { maxLength: 1000 },
          },
          {
            label: "Caregiver Signature",
            type: "SIGNATURE" as FormFieldType,
            required: true,
            config: null,
          },
        ],
      },
    ],
  },
];

// GET /api/visit-notes/templates/starters - Get starter templates
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return starter templates without sections for the list
    const starters = STARTER_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      sectionsCount: t.sections.length,
      fieldsCount: t.sections.reduce((sum, s) => sum + s.fields.length, 0),
    }));

    return NextResponse.json({ starters });
  } catch (error) {
    console.error("Error fetching starter templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch starter templates" },
      { status: 500 }
    );
  }
}

// Helper to convert null config to Prisma DbNull
function configToPrisma(
  config: unknown
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (config === null) {
    return Prisma.DbNull;
  }
  return config as Prisma.InputJsonValue;
}

// POST /api/visit-notes/templates/starters - Clone a starter template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { starterId } = body;

    if (!starterId) {
      return NextResponse.json(
        { error: "Starter template ID is required" },
        { status: 400 }
      );
    }

    const starter = STARTER_TEMPLATES.find((t) => t.id === starterId);
    if (!starter) {
      return NextResponse.json(
        { error: "Starter template not found" },
        { status: 404 }
      );
    }

    // Create the template from the starter
    const template = await prisma.formTemplate.create({
      data: {
        companyId: session.user.companyId,
        createdById: session.user.id,
        name: starter.name,
        description: starter.description,
        status: "DRAFT",
        isEnabled: false,
        sections: {
          create: starter.sections.map((section, sectionIndex) => ({
            title: section.title,
            description: section.description,
            order: sectionIndex,
            fields: {
              create: section.fields.map((field, fieldIndex) => ({
                label: field.label,
                type: field.type,
                required: field.required,
                order: fieldIndex,
                config: configToPrisma(field.config),
              })),
            },
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "FORM_TEMPLATE_CREATED_FROM_STARTER",
        entityType: "FormTemplate",
        entityId: template.id,
        changes: {
          starterId,
          starterName: starter.name,
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error cloning starter template:", error);
    return NextResponse.json(
      { error: "Failed to clone starter template" },
      { status: 500 }
    );
  }
}
