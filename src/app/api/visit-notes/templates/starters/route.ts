import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { FormFieldType, Prisma } from "@prisma/client";

// Pre-defined starter templates
const STARTER_TEMPLATES = [
  {
    id: "medicaid-compliant",
    name: "Medicaid Billing Compliant",
    description: "Complete documentation required for Medicaid claim submission with all mandatory fields",
    sections: [
      {
        title: "Service Information",
        description: "Required service details for billing",
        fields: [
          {
            label: "Service Type",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Personal Care Services (T1019)",
                "Attendant Care (S5125)",
                "Homemaker Services (S5130)",
                "Companion Services (S5135)",
                "Respite Care (T1005)",
                "Home Health Aide (G0156)",
                "Skilled Nursing (G0299)",
                "Other",
              ],
            },
          },
          {
            label: "Place of Service",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "12 - Home",
                "13 - Assisted Living Facility",
                "14 - Group Home",
                "33 - Custodial Care Facility",
                "99 - Other",
              ],
            },
          },
          {
            label: "Service Start Time",
            type: "TIME" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Service End Time",
            type: "TIME" as FormFieldType,
            required: true,
            config: null,
          },
        ],
      },
      {
        title: "Activities of Daily Living (ADLs)",
        description: "Check all ADL tasks performed during this visit",
        fields: [
          {
            label: "Personal Hygiene Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Bathing/Showering - Full assistance",
                "Bathing/Showering - Partial assistance",
                "Oral Care (brushing teeth, denture care)",
                "Hair Care (washing, combing, styling)",
                "Shaving",
                "Nail Care (hands/feet)",
                "Skin Care/Lotion Application",
              ],
            },
          },
          {
            label: "Dressing Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Dressing - Full assistance",
                "Dressing - Partial assistance",
                "Undressing assistance",
                "Selecting appropriate clothing",
                "Putting on/removing prosthetics, braces",
              ],
            },
          },
          {
            label: "Toileting Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Toileting assistance",
                "Incontinence care",
                "Catheter care",
                "Colostomy/Ostomy care",
                "Bedpan/Urinal assistance",
              ],
            },
          },
          {
            label: "Mobility & Transfer Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Bed to Chair transfer",
                "Chair to Standing transfer",
                "Walking assistance",
                "Wheelchair assistance",
                "Bed repositioning/Turning",
                "Range of Motion exercises",
              ],
            },
          },
          {
            label: "Eating/Feeding Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Feeding assistance - Full",
                "Feeding assistance - Partial",
                "Cutting food/Opening containers",
                "Monitoring food/fluid intake",
                "Tube feeding assistance",
              ],
            },
          },
        ],
      },
      {
        title: "Instrumental Activities of Daily Living (IADLs)",
        description: "Check all IADL tasks performed during this visit",
        fields: [
          {
            label: "Meal Preparation",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Meal planning",
                "Cooking/Preparing meals",
                "Setting up meals",
                "Cleaning up after meals",
                "Following dietary restrictions",
              ],
            },
          },
          {
            label: "Housekeeping Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Light housekeeping",
                "Vacuuming/Sweeping",
                "Mopping floors",
                "Dusting",
                "Making/Changing bed linens",
                "Taking out trash",
                "Cleaning bathroom",
                "Cleaning kitchen",
              ],
            },
          },
          {
            label: "Laundry Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Washing clothes",
                "Drying clothes",
                "Folding clothes",
                "Putting away clothes",
                "Ironing",
              ],
            },
          },
          {
            label: "Medication Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Medication reminders",
                "Medication administration",
                "Organizing medications",
                "Picking up prescriptions",
              ],
            },
          },
          {
            label: "Other IADL Tasks",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Grocery shopping",
                "Errand assistance",
                "Appointment scheduling",
                "Transportation assistance",
                "Bill paying assistance",
                "Telephone assistance",
              ],
            },
          },
        ],
      },
      {
        title: "Client Condition & Observations",
        description: "Required health and safety observations",
        fields: [
          {
            label: "Client's General Condition",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Stable - No changes from baseline",
                "Improved from previous visit",
                "Declined from previous visit",
                "New concerns noted",
              ],
            },
          },
          {
            label: "Client's Mood/Mental Status",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Alert and oriented",
                "Calm and cooperative",
                "Anxious/Agitated",
                "Confused/Disoriented",
                "Depressed/Withdrawn",
                "Other (describe in notes)",
              ],
            },
          },
          {
            label: "Skin Condition",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Intact - No concerns",
                "Dry skin noted",
                "Redness observed",
                "Bruising observed",
                "Wound/Pressure sore present",
                "Reported to supervisor",
              ],
            },
          },
          {
            label: "Appetite/Nutrition",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Good - Ate/Drank well",
                "Fair - Ate/Drank some",
                "Poor - Minimal intake",
                "Refused food/fluids",
                "Not applicable this visit",
              ],
            },
          },
          {
            label: "Mobility Status",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Independent",
                "Minimal assistance needed",
                "Moderate assistance needed",
                "Maximum assistance needed",
                "Total dependence",
                "Bedbound",
              ],
            },
          },
          {
            label: "Safety Concerns",
            type: "MULTIPLE_CHOICE" as FormFieldType,
            required: false,
            config: {
              options: [
                "Fall risk observed",
                "Wandering risk",
                "Medication non-compliance",
                "Signs of self-neglect",
                "Environmental hazards noted",
                "Suspected abuse/neglect",
                "None observed",
              ],
            },
          },
        ],
      },
      {
        title: "Progress Notes",
        description: "Narrative documentation of the visit",
        fields: [
          {
            label: "Visit Summary",
            type: "TEXT_LONG" as FormFieldType,
            required: true,
            config: {
              maxLength: 2000,
              placeholder: "Describe the services provided, client's response, and any notable events during the visit...",
            },
          },
          {
            label: "Goals Addressed",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: {
              maxLength: 1000,
              placeholder: "Document progress toward care plan goals addressed during this visit...",
            },
          },
          {
            label: "Changes or Incidents",
            type: "TEXT_LONG" as FormFieldType,
            required: false,
            config: {
              maxLength: 1000,
              placeholder: "Document any changes in condition, incidents, or events requiring follow-up...",
            },
          },
          {
            label: "Was supervisor/nurse notified of any concerns?",
            type: "YES_NO" as FormFieldType,
            required: true,
            config: null,
          },
        ],
      },
      {
        title: "Verification & Signatures",
        description: "Required signatures for Medicaid compliance",
        fields: [
          {
            label: "Photo Documentation (optional)",
            type: "PHOTO" as FormFieldType,
            required: false,
            config: null,
          },
          {
            label: "I certify that I provided the services documented above",
            type: "YES_NO" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Caregiver Signature",
            type: "SIGNATURE" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Client/Representative Acknowledgment",
            type: "SINGLE_CHOICE" as FormFieldType,
            required: true,
            config: {
              options: [
                "Client signed below",
                "Authorized representative signed below",
                "Client unable to sign - documented reason",
                "Client refused to sign - documented reason",
              ],
            },
          },
          {
            label: "Client/Representative Signature",
            type: "SIGNATURE" as FormFieldType,
            required: true,
            config: null,
          },
          {
            label: "Reason if client unable/refused to sign",
            type: "TEXT_SHORT" as FormFieldType,
            required: false,
            config: {
              maxLength: 200,
              placeholder: "Explain why client could not sign...",
            },
          },
        ],
      },
    ],
  },
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
