import { PrismaClient, FormFieldType, FormTemplateStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Base structure for autism waiver treatment plans
function getBaseTreatmentPlanSections(treatmentType: string) {
  return [
    // Section 1: Treatment Plan Information
    {
      title: "Treatment Plan Information",
      description: "Basic information about the treatment plan",
      order: 0,
      fields: [
        {
          label: "Treatment Plan Type",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 0,
          config: { placeholder: treatmentType },
        },
        {
          label: "Plan Version",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: ["Initial", "Provisional", "Annual Review", "Revision"],
          },
        },
        {
          label: "Effective Start Date",
          type: FormFieldType.DATE,
          required: true,
          order: 2,
          config: {},
        },
        {
          label: "Effective End Date",
          type: FormFieldType.DATE,
          required: true,
          order: 3,
          config: {},
        },
        {
          label: "Authorization Number",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 4,
          config: { placeholder: "DDA/Medicaid authorization number" },
        },
        {
          label: "Authorized Hours Per Week",
          type: FormFieldType.NUMBER,
          required: false,
          order: 5,
          config: { min: 0, max: 168 },
        },
      ],
    },

    // Section 2: Participant Information
    {
      title: "Participant Information",
      description: "Information about the client and family",
      order: 1,
      fields: [
        {
          label: "Participant Name",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 0,
          config: { placeholder: "Client's full name" },
        },
        {
          label: "Date of Birth",
          type: FormFieldType.DATE,
          required: true,
          order: 1,
          config: {},
        },
        {
          label: "Medicaid Number",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 2,
          config: {},
        },
        {
          label: "Parent/Guardian Name",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 3,
          config: {},
        },
        {
          label: "Parent/Guardian Phone",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 4,
          config: {},
        },
        {
          label: "Parent/Guardian Email",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 5,
          config: { placeholder: "Email for signature notifications" },
        },
        {
          label: "Service Coordinator Name",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 6,
          config: {},
        },
        {
          label: "Service Coordinator Phone",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 7,
          config: {},
        },
      ],
    },

    // Section 3: Current Functioning & Baseline
    {
      title: "Current Functioning & Baseline",
      description: "Assessment of current skills and abilities",
      order: 2,
      fields: [
        {
          label: "Primary Diagnosis",
          type: FormFieldType.ICD10_DIAGNOSIS,
          required: true,
          order: 0,
          config: {},
        },
        {
          label: "Current Communication Level",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: [
              "Verbal - Full sentences",
              "Verbal - Phrases/Short sentences",
              "Verbal - Single words",
              "Non-verbal with AAC",
              "Non-verbal - Gestures only",
              "Non-verbal - Limited communication",
            ],
          },
        },
        {
          label: "Current Self-Care Level",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 2,
          config: {
            options: [
              "Independent in all areas",
              "Independent with occasional prompting",
              "Requires moderate assistance",
              "Requires significant assistance",
              "Fully dependent on caregiver",
            ],
          },
        },
        {
          label: "Current Socialization Level",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 3,
          config: {
            options: [
              "Age-appropriate social skills",
              "Emerging social skills",
              "Limited social interaction",
              "Minimal social awareness",
            ],
          },
        },
        {
          label: "Behavioral Challenges",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: false,
          order: 4,
          config: {
            options: [
              "Aggression",
              "Self-injury",
              "Property destruction",
              "Elopement",
              "Non-compliance",
              "Tantrums/Meltdowns",
              "Pica",
              "Stereotypy (Disruptive)",
              "None significant",
            ],
          },
        },
        {
          label: "Strengths & Interests",
          type: FormFieldType.TEXT_LONG,
          required: true,
          order: 5,
          config: { placeholder: "Describe client's strengths, interests, and motivators..." },
        },
        {
          label: "Baseline Summary",
          type: FormFieldType.TEXT_LONG,
          required: true,
          order: 6,
          config: { placeholder: "Summarize current functioning across all domains..." },
        },
      ],
    },

    // Section 4: Treatment Goals
    {
      title: "Treatment Goals",
      description: "Goals and objectives for the treatment period",
      order: 3,
      fields: [
        {
          label: "Goal 1: Domain",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Communication",
              "Self-Care/Daily Living",
              "Socialization",
              "Behavior Management",
              "Safety/Survival Skills",
              "Community Integration",
              "Pre-Vocational/Vocational",
              "Academic/Cognitive",
              "Motor Skills",
              "Play/Leisure",
            ],
          },
        },
        {
          label: "Goal 1: Description",
          type: FormFieldType.TEXT_LONG,
          required: true,
          order: 1,
          config: { placeholder: "Write a specific, measurable goal..." },
        },
        {
          label: "Goal 1: Baseline",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 2,
          config: { placeholder: "Current level of performance (e.g., 20% of opportunities)" },
        },
        {
          label: "Goal 1: Target",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 3,
          config: { placeholder: "Target level (e.g., 80% of opportunities)" },
        },
        {
          label: "Goal 1: Short-Term Objectives",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 4,
          config: { placeholder: "Break down the goal into smaller objectives..." },
        },
        {
          label: "Goal 1: Task Analysis/Strategies",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 5,
          config: { placeholder: "List specific strategies and interventions to achieve this goal..." },
        },
        // Goal 2
        {
          label: "Goal 2: Domain",
          type: FormFieldType.SINGLE_CHOICE,
          required: false,
          order: 6,
          config: {
            options: [
              "Communication",
              "Self-Care/Daily Living",
              "Socialization",
              "Behavior Management",
              "Safety/Survival Skills",
              "Community Integration",
              "Pre-Vocational/Vocational",
              "Academic/Cognitive",
              "Motor Skills",
              "Play/Leisure",
            ],
          },
        },
        {
          label: "Goal 2: Description",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 7,
          config: { placeholder: "Write a specific, measurable goal..." },
        },
        {
          label: "Goal 2: Baseline",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 8,
          config: {},
        },
        {
          label: "Goal 2: Target",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 9,
          config: {},
        },
        {
          label: "Goal 2: Short-Term Objectives",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 10,
          config: {},
        },
        // Goal 3
        {
          label: "Goal 3: Domain",
          type: FormFieldType.SINGLE_CHOICE,
          required: false,
          order: 11,
          config: {
            options: [
              "Communication",
              "Self-Care/Daily Living",
              "Socialization",
              "Behavior Management",
              "Safety/Survival Skills",
              "Community Integration",
              "Pre-Vocational/Vocational",
              "Academic/Cognitive",
              "Motor Skills",
              "Play/Leisure",
            ],
          },
        },
        {
          label: "Goal 3: Description",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 12,
          config: { placeholder: "Write a specific, measurable goal..." },
        },
        {
          label: "Goal 3: Baseline",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 13,
          config: {},
        },
        {
          label: "Goal 3: Target",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 14,
          config: {},
        },
        {
          label: "Goal 3: Short-Term Objectives",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 15,
          config: {},
        },
        {
          label: "Additional Goals (if any)",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 16,
          config: { placeholder: "Document any additional goals..." },
        },
      ],
    },

    // Section 5: Service Schedule
    {
      title: "Service Schedule",
      description: "Scheduling details for services",
      order: 4,
      fields: [
        {
          label: "Session Frequency",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Multiple times per week",
              "Weekly",
              "Bi-weekly",
              "Monthly",
              "As needed",
            ],
          },
        },
        {
          label: "Typical Sessions Per Week",
          type: FormFieldType.NUMBER,
          required: false,
          order: 1,
          config: { min: 0, max: 14 },
        },
        {
          label: "Typical Session Duration (hours)",
          type: FormFieldType.NUMBER,
          required: false,
          order: 2,
          config: { min: 0, max: 8 },
        },
        {
          label: "Preferred Days",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: false,
          order: 3,
          config: {
            options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          },
        },
        {
          label: "Preferred Time of Day",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: false,
          order: 4,
          config: {
            options: ["Morning (8am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)"],
          },
        },
        {
          label: "Service Location(s)",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 5,
          config: {
            options: ["Client's Home", "Community", "School", "Day Program", "Provider Office"],
          },
        },
        {
          label: "Schedule Notes",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 6,
          config: { placeholder: "Any special scheduling considerations..." },
        },
      ],
    },

    // Section 6: Clinical Justification
    {
      title: "Clinical Justification",
      description: "Medical necessity and clinical rationale",
      order: 5,
      fields: [
        {
          label: "Medical Necessity Statement",
          type: FormFieldType.TEXT_LONG,
          required: true,
          order: 0,
          config: { placeholder: "Explain why these services are medically necessary for this client..." },
        },
        {
          label: "Expected Outcomes",
          type: FormFieldType.TEXT_LONG,
          required: true,
          order: 1,
          config: { placeholder: "What outcomes are expected from this treatment plan?" },
        },
        {
          label: "Risk Without Services",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 2,
          config: { placeholder: "What risks would the client face without these services?" },
        },
        {
          label: "Discharge Criteria",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 3,
          config: { placeholder: "Criteria for transitioning or discharge from services..." },
        },
      ],
    },

    // Section 7: Signatures & Authorization
    {
      title: "Signatures & Authorization",
      description: "Required signatures for treatment plan approval",
      order: 6,
      fields: [
        {
          label: "Provider Name",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 0,
          config: {},
        },
        {
          label: "Provider Signature",
          type: FormFieldType.SIGNATURE,
          required: true,
          order: 1,
          config: {},
        },
        {
          label: "Provider Signature Date",
          type: FormFieldType.DATE,
          required: true,
          order: 2,
          config: {},
        },
        {
          label: "Clinical Supervisor Name",
          type: FormFieldType.TEXT_SHORT,
          required: false,
          order: 3,
          config: {},
        },
        {
          label: "Clinical Supervisor Signature",
          type: FormFieldType.SIGNATURE,
          required: false,
          order: 4,
          config: {},
        },
        {
          label: "Supervisor Signature Date",
          type: FormFieldType.DATE,
          required: false,
          order: 5,
          config: {},
        },
        {
          label: "Parent/Guardian Name (for consent)",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 6,
          config: {},
        },
        {
          label: "Relationship to Client",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 7,
          config: {
            options: ["Parent", "Legal Guardian", "Power of Attorney", "Self (if adult)"],
          },
        },
        {
          label: "Parent/Guardian Signature",
          type: FormFieldType.SIGNATURE,
          required: true,
          order: 8,
          config: {},
        },
        {
          label: "Parent Signature Date",
          type: FormFieldType.DATE,
          required: true,
          order: 9,
          config: {},
        },
        {
          label: "Consent Statement",
          type: FormFieldType.YES_NO,
          required: true,
          order: 10,
          config: {},
        },
      ],
    },
  ];
}

// Service-specific sections for different treatment types
function getIISSSpecificSections() {
  return [
    {
      title: "IISS Service Configuration",
      description: "Configuration specific to Intensive Individual Support Services",
      order: 7,
      fields: [
        {
          label: "Primary IISS Focus Areas",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Communication Development",
              "Daily Living Skills",
              "Behavior Support",
              "Social Skills",
              "Community Integration",
              "Safety Skills",
              "Sensory/Motor Development",
              "Academic Support",
            ],
          },
        },
        {
          label: "Behavior Support Plan Required",
          type: FormFieldType.YES_NO,
          required: true,
          order: 1,
          config: {},
        },
        {
          label: "Behavior Support Plan Summary",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 2,
          config: { placeholder: "If BSP exists, summarize key strategies..." },
        },
        {
          label: "Staff Requirements",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 3,
          config: {
            options: [
              "1:1 Support",
              "2:1 Support (two staff)",
              "1:1 with Backup Available",
              "Shared Support",
            ],
          },
        },
      ],
    },
  ];
}

function getFCSpecificSections() {
  return [
    {
      title: "Family Consultation Configuration",
      description: "Configuration specific to Family Consultation services",
      order: 7,
      fields: [
        {
          label: "Primary Family Training Goals",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Behavior Management Strategies",
              "Communication Techniques",
              "Daily Routine Support",
              "Sensory Strategies",
              "Safety Planning",
              "Crisis Prevention",
              "Community Resource Navigation",
              "Sibling Support",
              "Self-Care for Caregivers",
            ],
          },
        },
        {
          label: "Primary Family Member to Train",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: ["Mother", "Father", "Both Parents", "Grandparent", "Other Caregiver"],
          },
        },
        {
          label: "Family Training Notes",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 2,
          config: { placeholder: "Specific training needs and considerations..." },
        },
      ],
    },
  ];
}

function getITISpecificSections() {
  return [
    {
      title: "Therapeutic Integration Configuration",
      description: "Configuration specific to Individual Therapeutic Integration services",
      order: 7,
      fields: [
        {
          label: "Therapeutic Approaches",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Applied Behavior Analysis (ABA)",
              "Social Skills Training",
              "Cognitive Behavioral Techniques",
              "Sensory Integration",
              "Visual Supports",
              "Structured Teaching (TEACCH)",
              "Natural Environment Training",
              "Pivotal Response Training",
            ],
          },
        },
        {
          label: "Community Integration Settings",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: [
              "Retail Stores",
              "Restaurants",
              "Public Transportation",
              "Recreation Facilities",
              "Libraries",
              "Employment Sites",
              "Social Events",
              "Medical Appointments",
            ],
          },
        },
        {
          label: "Therapeutic Integration Notes",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 2,
          config: { placeholder: "Specific therapeutic interventions planned..." },
        },
      ],
    },
  ];
}

function getALPSpecificSections() {
  return [
    {
      title: "Adaptive Living Program Configuration",
      description: "Configuration specific to Adaptive Living Program services",
      order: 7,
      fields: [
        {
          label: "ALP Focus Areas",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Personal Hygiene",
              "Meal Preparation",
              "Household Management",
              "Money Management",
              "Time Management",
              "Transportation Skills",
              "Health & Safety",
              "Social Participation",
              "Pre-Vocational Skills",
              "Self-Advocacy",
            ],
          },
        },
        {
          label: "Program Setting",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: ["Day Program Site", "Community-Based", "Home-Based", "Mixed Settings"],
          },
        },
        {
          label: "Vocational Readiness",
          type: FormFieldType.SINGLE_CHOICE,
          required: false,
          order: 2,
          config: {
            options: [
              "Not applicable (child)",
              "Pre-vocational exploration",
              "Vocational training",
              "Supported employment ready",
              "Competitive employment ready",
            ],
          },
        },
        {
          label: "ALP Program Notes",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 3,
          config: { placeholder: "Specific adaptive living goals and activities..." },
        },
      ],
    },
  ];
}

function getRespiteSpecificSections() {
  return [
    {
      title: "Respite Service Configuration",
      description: "Configuration specific to Respite services",
      order: 7,
      fields: [
        {
          label: "Respite Care Needs",
          type: FormFieldType.MULTIPLE_CHOICE,
          required: true,
          order: 0,
          config: {
            options: [
              "Personal Care Assistance",
              "Meal Preparation/Feeding",
              "Medication Administration",
              "Behavioral Support",
              "Companionship/Engagement",
              "Community Outings",
              "Overnight Care",
              "Transportation",
            ],
          },
        },
        {
          label: "Typical Respite Duration",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 1,
          config: {
            options: [
              "2-4 hours",
              "4-8 hours",
              "Full day (8+ hours)",
              "Overnight",
              "Weekend",
              "Variable",
            ],
          },
        },
        {
          label: "Respite Location Preference",
          type: FormFieldType.SINGLE_CHOICE,
          required: true,
          order: 2,
          config: {
            options: [
              "Client's Home",
              "Respite Provider's Home",
              "Community Settings",
              "Any Location",
            ],
          },
        },
        {
          label: "Emergency Contact During Respite",
          type: FormFieldType.TEXT_SHORT,
          required: true,
          order: 3,
          config: { placeholder: "Name and phone number" },
        },
        {
          label: "Special Instructions for Respite",
          type: FormFieldType.TEXT_LONG,
          required: false,
          order: 4,
          config: { placeholder: "Any special instructions for respite care providers..." },
        },
      ],
    },
  ];
}

// Template definitions
function getTemplates() {
  return [
    {
      name: "IISS Treatment Plan",
      description:
        "Intensive Individual Support Services treatment plan template. For 1:1 support services focused on skill development, behavior support, and community integration.",
      sections: [...getBaseTreatmentPlanSections("IISS - Intensive Individual Support Services"), ...getIISSSpecificSections()],
    },
    {
      name: "FC Treatment Plan",
      description:
        "Family Consultation treatment plan template. For family training, parent coaching, and home strategy implementation services.",
      sections: [...getBaseTreatmentPlanSections("FC - Family Consultation"), ...getFCSpecificSections()],
    },
    {
      name: "ITI Treatment Plan",
      description:
        "Individual Therapeutic Integration treatment plan template. For therapeutic interventions and community integration skill building.",
      sections: [...getBaseTreatmentPlanSections("ITI - Individual Therapeutic Integration"), ...getITISpecificSections()],
    },
    {
      name: "ALP Treatment Plan",
      description:
        "Adaptive Living Program treatment plan template. For independent living skills and community participation in day program settings.",
      sections: [...getBaseTreatmentPlanSections("ALP - Adaptive Living Program"), ...getALPSpecificSections()],
    },
    {
      name: "Respite Treatment Plan",
      description:
        "Respite care treatment plan template. For respite services providing temporary relief for caregivers.",
      sections: [...getBaseTreatmentPlanSections("Respite Care"), ...getRespiteSpecificSections()],
    },
  ];
}

async function main() {
  // Get the default company
  const company = await prisma.company.findFirst({
    where: {
      id: "default-company-001",
    },
  });
  if (!company) {
    throw new Error("No company found. Please create a company first.");
  }

  // Get the admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      companyId: company.id,
      role: "ADMIN",
    },
  });

  if (!adminUser) {
    throw new Error("No admin user found. Please create an admin user first.");
  }

  console.log(`Creating Autism Waiver Treatment Plan templates for company: ${company.name}\n`);

  const templates = getTemplates();

  for (const templateData of templates) {
    // Check if template already exists
    const existingTemplate = await prisma.carePlanTemplate.findFirst({
      where: {
        companyId: company.id,
        name: templateData.name,
      },
    });

    if (existingTemplate) {
      console.log(`Template "${templateData.name}" already exists, deleting and recreating...`);
      await prisma.carePlanTemplateField.deleteMany({
        where: {
          section: {
            templateId: existingTemplate.id,
          },
        },
      });
      await prisma.carePlanTemplateSection.deleteMany({
        where: { templateId: existingTemplate.id },
      });
      await prisma.carePlanTemplate.delete({
        where: { id: existingTemplate.id },
      });
    }

    // Create the template
    const template = await prisma.carePlanTemplate.create({
      data: {
        companyId: company.id,
        createdById: adminUser.id,
        name: templateData.name,
        description: templateData.description,
        status: FormTemplateStatus.ACTIVE,
        isEnabled: true,
        version: 1,
        sections: {
          create: templateData.sections.map((section) => ({
            title: section.title,
            description: section.description,
            order: section.order,
            fields: {
              create: section.fields.map((field) => ({
                label: field.label,
                type: field.type,
                required: field.required,
                order: field.order,
                config: field.config,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            fields: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    const totalFields = template.sections.reduce((acc, s) => acc + s.fields.length, 0);
    console.log(`✅ Created: ${template.name}`);
    console.log(`   ID: ${template.id}`);
    console.log(`   Sections: ${template.sections.length}, Fields: ${totalFields}\n`);
  }

  console.log("✅ All Autism Waiver Treatment Plan templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
