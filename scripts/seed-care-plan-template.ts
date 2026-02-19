import { PrismaClient, FormFieldType, FormTemplateStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get the default company that has users
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

  console.log(`Creating care plan template for company: ${company.name}`);

  // Check if template already exists
  const existingTemplate = await prisma.carePlanTemplate.findFirst({
    where: {
      companyId: company.id,
      name: "Standard Plan of Care (CMS-485)",
    },
  });

  if (existingTemplate) {
    console.log("Template already exists, deleting and recreating...");
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
      name: "Standard Plan of Care (CMS-485)",
      description:
        "Comprehensive home health care plan template following CMS-485 guidelines. Includes all required sections for Medicare/Medicaid compliance.",
      status: FormTemplateStatus.ACTIVE,
      isEnabled: true,
      version: 1,
      sections: {
        create: [
          // Section 1: Basic Information
          {
            title: "Basic Information",
            description: "Certification dates, physician, and case manager",
            order: 0,
            fields: {
              create: [
                {
                  label: "Effective Date",
                  type: FormFieldType.DATE,
                  required: true,
                  order: 0,
                  config: {},
                },
                {
                  label: "End Date",
                  type: FormFieldType.DATE,
                  required: false,
                  order: 1,
                  config: {},
                },
                {
                  label: "Certification Start Date",
                  type: FormFieldType.DATE,
                  required: true,
                  order: 2,
                  config: {},
                },
                {
                  label: "Certification End Date",
                  type: FormFieldType.DATE,
                  required: true,
                  order: 3,
                  config: {},
                },
                {
                  label: "Verbal SOC Date",
                  type: FormFieldType.DATE,
                  required: false,
                  order: 4,
                  config: {},
                },
                {
                  label: "Signature Sent Date",
                  type: FormFieldType.DATE,
                  required: false,
                  order: 5,
                  config: {},
                },
                {
                  label: "Signature Received Date",
                  type: FormFieldType.DATE,
                  required: false,
                  order: 6,
                  config: {},
                },
              ],
            },
          },
          // Section 2: Physician Information
          {
            title: "Physician Information",
            description: "Attending physician details",
            order: 1,
            fields: {
              create: [
                {
                  label: "Physician Name",
                  type: FormFieldType.TEXT_SHORT,
                  required: true,
                  order: 0,
                  config: { placeholder: "Enter physician name" },
                },
                {
                  label: "NPI Number",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 1,
                  config: { placeholder: "Enter NPI number" },
                },
                {
                  label: "Phone Number",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 2,
                  config: { placeholder: "Enter phone number" },
                },
                {
                  label: "Fax Number",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 3,
                  config: { placeholder: "+1234567890 (E.164 format)" },
                },
              ],
            },
          },
          // Section 3: Diagnoses
          {
            title: "Diagnoses (ICD-10)",
            description: "Primary and secondary diagnoses",
            order: 2,
            fields: {
              create: [
                {
                  label: "ICD-10 Diagnoses",
                  type: FormFieldType.ICD10_DIAGNOSIS,
                  required: true,
                  order: 0,
                  config: {},
                },
              ],
            },
          },
          // Section 4: Medications
          {
            title: "Medications",
            description: "Current medications and dosages",
            order: 3,
            fields: {
              create: [
                {
                  label: "Current Medications",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 0,
                  config: {
                    placeholder:
                      "List all current medications with dosages and frequency...",
                  },
                },
                {
                  label: "Allergies",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                  config: { placeholder: "List all known allergies..." },
                },
              ],
            },
          },
          // Section 5: DME / Safety / Nutrition
          {
            title: "DME / Safety / Nutrition",
            description: "Equipment, safety measures, and dietary requirements",
            order: 4,
            fields: {
              create: [
                {
                  label: "DME and Supplies",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 0,
                  config: {
                    placeholder: "List durable medical equipment and supplies...",
                  },
                },
                {
                  label: "Safety Measures",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                  config: {
                    placeholder: "List safety measures and precautions...",
                  },
                },
                {
                  label: "Nutritional Requirements",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 2,
                  config: {
                    placeholder:
                      "Dietary restrictions, requirements, and recommendations...",
                  },
                },
              ],
            },
          },
          // Section 6: Functional Status
          {
            title: "Functional Status",
            description: "Limitations, activities, and mental status",
            order: 5,
            fields: {
              create: [
                {
                  label: "Functional Limitations",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 0,
                  config: {
                    options: [
                      "Amputation",
                      "Bowel/Bladder Incontinence",
                      "Contracture",
                      "Hearing",
                      "Paralysis",
                      "Endurance",
                      "Ambulation",
                      "Speech",
                      "Legally Blind",
                      "Dyspnea with Minimal Exertion",
                      "Other",
                    ],
                  },
                },
                {
                  label: "Other Functional Limitation",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 1,
                  config: { placeholder: "Specify if Other selected above" },
                },
                {
                  label: "Activities Permitted",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      "Complete Bedrest",
                      "Bedrest BRP",
                      "Up as Tolerated",
                      "Transfer Bed/Chair",
                      "Exercises Prescribed",
                      "Partial Weight Bearing",
                      "Independent at Home",
                      "Crutches",
                      "Cane",
                      "Wheelchair",
                      "Walker",
                      "No Restrictions",
                      "Other",
                    ],
                  },
                },
                {
                  label: "Other Activities Permitted",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 3,
                  config: { placeholder: "Specify if Other selected above" },
                },
                {
                  label: "Mental Status",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      "Oriented",
                      "Comatose",
                      "Forgetful",
                      "Depressed",
                      "Disoriented",
                      "Lethargic",
                      "Agitated",
                      "Other",
                    ],
                  },
                },
                {
                  label: "Other Mental Status",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 5,
                  config: { placeholder: "Specify if Other selected above" },
                },
                {
                  label: "Prognosis",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 6,
                  config: {
                    options: ["Poor", "Guarded", "Fair", "Good", "Excellent"],
                  },
                },
              ],
            },
          },
          // Section 7: Clinical Narratives
          {
            title: "Clinical Narratives",
            description:
              "Care preferences, rehab potential, and discharge planning",
            order: 6,
            fields: {
              create: [
                {
                  label: "Cognitive Status",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 0,
                  config: {},
                },
                {
                  label: "Rehabilitation Potential",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                  config: {},
                },
                {
                  label: "Homebound Status",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 2,
                  config: {},
                },
                {
                  label: "Caregiver Needs",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 3,
                  config: {},
                },
                {
                  label: "Risk Interventions",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                  config: {},
                },
                {
                  label: "Advanced Directives",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 5,
                  config: {},
                },
                {
                  label: "Discharge Plan",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 6,
                  config: {},
                },
                {
                  label: "Care Preferences",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 7,
                  config: {},
                },
              ],
            },
          },
          // Section 8: Orders & Goals
          {
            title: "Orders & Goals",
            description: "Discipline-specific orders and treatment goals",
            order: 7,
            fields: {
              create: [
                {
                  label: "Skilled Nursing (SN) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 0,
                  config: { placeholder: "Enter SN orders and goals..." },
                },
                {
                  label: "Physical Therapy (PT) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                  config: { placeholder: "Enter PT orders and goals..." },
                },
                {
                  label: "Occupational Therapy (OT) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 2,
                  config: { placeholder: "Enter OT orders and goals..." },
                },
                {
                  label: "Speech Therapy (ST) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 3,
                  config: { placeholder: "Enter ST orders and goals..." },
                },
                {
                  label: "Home Health Aide (HHA) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                  config: { placeholder: "Enter HHA orders and goals..." },
                },
                {
                  label: "Medical Social Worker (MSW) Orders",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 5,
                  config: { placeholder: "Enter MSW orders and goals..." },
                },
              ],
            },
          },
          // Section 9: Clinical Summary
          {
            title: "Clinical Summary",
            description: "Plan summary and internal notes",
            order: 8,
            fields: {
              create: [
                {
                  label: "Care Plan Summary",
                  type: FormFieldType.TEXT_LONG,
                  required: true,
                  order: 0,
                  config: {
                    placeholder:
                      "Provide a comprehensive summary of the care plan...",
                  },
                },
                {
                  label: "Physician Certification Statement",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                  config: { placeholder: "Physician certification statement..." },
                },
                {
                  label: "Care Level",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      "Skilled Nursing",
                      "Personal Care",
                      "Companion Care",
                      "Respite Care",
                      "Hospice Support",
                    ],
                  },
                },
                {
                  label: "Recommended Hours Per Week",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 3,
                  config: { min: 0, max: 168 },
                },
                {
                  label: "Internal Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                  config: { placeholder: "Notes visible only to staff..." },
                },
              ],
            },
          },
          // Section 10: Signatures
          {
            title: "Signatures",
            description: "Required signatures for care plan approval",
            order: 9,
            fields: {
              create: [
                {
                  label: "Nurse Signature",
                  type: FormFieldType.SIGNATURE,
                  required: true,
                  order: 0,
                  config: {},
                },
                {
                  label: "Client/Representative Name",
                  type: FormFieldType.TEXT_SHORT,
                  required: true,
                  order: 1,
                  config: { placeholder: "Name of signer" },
                },
                {
                  label: "Relationship to Client",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: true,
                  order: 2,
                  config: {
                    options: [
                      "Self",
                      "Spouse",
                      "Parent",
                      "Child",
                      "Sibling",
                      "Legal Guardian",
                      "Power of Attorney",
                      "Other",
                    ],
                  },
                },
                {
                  label: "Client/Representative Signature",
                  type: FormFieldType.SIGNATURE,
                  required: true,
                  order: 3,
                  config: {},
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          fields: true,
        },
      },
    },
  });

  console.log(`\nCreated care plan template: ${template.name}`);
  console.log(`Template ID: ${template.id}`);
  console.log(`Sections: ${template.sections.length}`);
  console.log(
    `Total fields: ${template.sections.reduce((acc, s) => acc + s.fields.length, 0)}`
  );
  console.log("\nSections:");
  template.sections.forEach((section) => {
    console.log(`  - ${section.title} (${section.fields.length} fields)`);
  });

  console.log("\n✅ Care plan template seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
