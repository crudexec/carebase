/**
 * Fix script to add sections to existing Discharge Summary template
 *
 * Run with: npx tsx scripts/fix-discharge-summary-template.ts
 */

import { PrismaClient, AssessmentSectionType, AssessmentResponseType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface ItemData {
  code: string;
  question: string;
  responseType: AssessmentResponseType;
  isRequired: boolean;
  displayOrder: number;
  description?: string;
  responseOptions?: Prisma.InputJsonValue;
  minValue?: number;
  maxValue?: number;
}

const SECTIONS_DATA = [
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Discharge Information",
    description: "Basic discharge details and reason for discharge",
    displayOrder: 0,
    items: [
      { code: "DISCHARGE_DATE", question: "Date of Discharge", responseType: AssessmentResponseType.DATE, isRequired: true, displayOrder: 0 },
      {
        code: "DISCHARGE_REASON",
        question: "Reason for Discharge",
        responseType: AssessmentResponseType.SINGLE_CHOICE,
        isRequired: true,
        displayOrder: 1,
        responseOptions: [
          { value: "goals_met", label: "Goals Met / Treatment Complete" },
          { value: "transferred", label: "Transferred to Another Provider" },
          { value: "hospitalized", label: "Hospitalized" },
          { value: "patient_request", label: "Patient/Family Request" },
          { value: "deceased", label: "Deceased" },
          { value: "other", label: "Other" },
        ]
      },
      {
        code: "DISCHARGE_DESTINATION",
        question: "Discharge Destination",
        responseType: AssessmentResponseType.SINGLE_CHOICE,
        isRequired: true,
        displayOrder: 2,
        responseOptions: [
          { value: "home_self", label: "Home - Self Care" },
          { value: "home_family", label: "Home - Family/Caregiver Support" },
          { value: "snf", label: "Skilled Nursing Facility" },
          { value: "hospital", label: "Hospital" },
          { value: "hospice", label: "Hospice" },
          { value: "other", label: "Other" },
        ]
      },
      { code: "DISCHARGE_NOTES", question: "Additional Notes on Discharge", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 3 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Care Summary",
    description: "Summary of care provided during service period",
    displayOrder: 1,
    items: [
      { code: "ADMISSION_DATE", question: "Date of Admission", responseType: AssessmentResponseType.DATE, isRequired: true, displayOrder: 0 },
      { code: "PRIMARY_DIAGNOSIS", question: "Primary Diagnosis", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 1 },
      { code: "SERVICES_PROVIDED", question: "Services Provided", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 2, description: "List all services provided during the care period" },
      { code: "CARE_NARRATIVE", question: "Care Narrative", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 3, description: "Brief summary of the patient's care journey" },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Clinical Status at Discharge",
    description: "Patient's clinical condition at time of discharge",
    displayOrder: 2,
    items: [
      {
        code: "OVERALL_STATUS",
        question: "Overall Clinical Status",
        responseType: AssessmentResponseType.SINGLE_CHOICE,
        isRequired: true,
        displayOrder: 0,
        responseOptions: [
          { value: "improved", label: "Improved" },
          { value: "stable", label: "Stable" },
          { value: "declined", label: "Declined" },
        ]
      },
      {
        code: "GOALS_ACHIEVED",
        question: "Were Care Goals Achieved?",
        responseType: AssessmentResponseType.YES_NO,
        isRequired: true,
        displayOrder: 1
      },
      { code: "GOALS_NOTES", question: "Goals Achievement Notes", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 2 },
      {
        code: "PAIN_LEVEL",
        question: "Pain Level at Discharge (0-10)",
        responseType: AssessmentResponseType.SCALE,
        isRequired: false,
        displayOrder: 3,
        minValue: 0,
        maxValue: 10
      },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Functional Status",
    description: "Patient's functional abilities at discharge",
    displayOrder: 3,
    items: [
      { code: "ADL_BATHING", question: "Bathing", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 0, minValue: 0, maxValue: 3, description: "0=Independent, 1=Supervision, 2=Limited Assistance, 3=Dependent" },
      { code: "ADL_DRESSING", question: "Dressing", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 1, minValue: 0, maxValue: 3 },
      { code: "ADL_TOILETING", question: "Toileting", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 2, minValue: 0, maxValue: 3 },
      { code: "ADL_TRANSFERRING", question: "Transferring", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 3, minValue: 0, maxValue: 3 },
      { code: "ADL_EATING", question: "Eating", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 4, minValue: 0, maxValue: 3 },
      { code: "AMBULATION", question: "Ambulation", responseType: AssessmentResponseType.SCALE, isRequired: true, displayOrder: 5, minValue: 0, maxValue: 3 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Medication Summary",
    description: "Medications at discharge",
    displayOrder: 4,
    items: [
      { code: "MEDICATION_LIST", question: "Current Medications at Discharge", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 0, description: "List all current medications with dosages" },
      { code: "MEDICATION_CHANGES", question: "Medication Changes During Care", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 1 },
      { code: "MEDICATION_COMPLIANCE", question: "Was Patient Compliant with Medications?", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 2 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Follow-up Instructions",
    description: "Instructions and recommendations for the patient",
    displayOrder: 5,
    items: [
      { code: "FOLLOWUP_APPOINTMENTS", question: "Scheduled Follow-up Appointments", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 0 },
      { code: "ACTIVITY_RESTRICTIONS", question: "Activity Restrictions", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 1 },
      { code: "DIET_INSTRUCTIONS", question: "Diet Instructions", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 2 },
      { code: "WARNING_SIGNS", question: "Warning Signs to Watch For", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 3 },
      { code: "EMERGENCY_INSTRUCTIONS", question: "When to Seek Emergency Care", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 4 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Patient/Caregiver Education",
    description: "Education provided at discharge",
    displayOrder: 6,
    items: [
      { code: "EDUCATION_TOPICS", question: "Education Topics Covered", responseType: AssessmentResponseType.TEXT, isRequired: true, displayOrder: 0 },
      { code: "EDUCATION_MATERIALS", question: "Written Materials Provided", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 1 },
      { code: "PATIENT_UNDERSTANDING", question: "Patient/Caregiver Demonstrated Understanding", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 2 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Referrals & Recommendations",
    description: "Referrals made and equipment recommendations",
    displayOrder: 7,
    items: [
      { code: "REFERRALS", question: "Referrals Made", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 0, description: "List any referrals to specialists or other services" },
      { code: "DME_NEEDS", question: "Durable Medical Equipment Needs", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 1 },
      { code: "COMMUNITY_RESOURCES", question: "Community Resources Recommended", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 2 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Physician Communication",
    description: "Communication with ordering physician",
    displayOrder: 8,
    items: [
      { code: "PHYSICIAN_NOTIFIED", question: "Physician Notified of Discharge", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 0 },
      { code: "NOTIFICATION_DATE", question: "Date of Physician Notification", responseType: AssessmentResponseType.DATE, isRequired: false, displayOrder: 1 },
      { code: "DISCHARGE_SUMMARY_SENT", question: "Discharge Summary Sent to Physician", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 2 },
    ],
  },
  {
    sectionType: AssessmentSectionType.CUSTOM,
    title: "Discharge Acknowledgment",
    description: "Signatures and final acknowledgments",
    displayOrder: 9,
    items: [
      { code: "PATIENT_SIGNATURE", question: "Patient/Representative Signature Obtained", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 0 },
      { code: "DISCHARGE_PACKET", question: "Discharge Packet Provided", responseType: AssessmentResponseType.YES_NO, isRequired: true, displayOrder: 1 },
      { code: "FINAL_NOTES", question: "Additional Notes", responseType: AssessmentResponseType.TEXT, isRequired: false, displayOrder: 2 },
    ],
  },
];

async function main() {
  console.log("Fixing Discharge Summary Assessment Template...\n");

  // Find all Discharge Summary templates with no sections
  const templates = await prisma.assessmentTemplate.findMany({
    where: { name: "Discharge Summary" },
    include: { sections: { include: { items: true } } },
  });

  if (templates.length === 0) {
    console.log("No Discharge Summary templates found.");
    return;
  }

  for (const template of templates) {
    console.log(`\nTemplate ID: ${template.id}`);
    console.log(`  Current sections: ${template.sections.length}`);

    const totalItems = template.sections.reduce((sum, s) => sum + s.items.length, 0);
    console.log(`  Current items: ${totalItems}`);

    if (template.sections.length > 0 && totalItems > 0) {
      console.log("  ✓ Template already has sections. Skipping.");
      continue;
    }

    // Delete existing empty sections if any
    if (template.sections.length > 0) {
      console.log("  Deleting empty sections...");
      await prisma.assessmentTemplateSection.deleteMany({
        where: { templateId: template.id },
      });
    }

    // Add sections with items
    console.log("  Adding sections...");

    for (const sectionData of SECTIONS_DATA) {
      const section = await prisma.assessmentTemplateSection.create({
        data: {
          templateId: template.id,
          sectionType: sectionData.sectionType,
          title: sectionData.title,
          description: sectionData.description || null,
          displayOrder: sectionData.displayOrder,
        },
      });

      // Add items to section
      for (const itemData of sectionData.items as ItemData[]) {
        await prisma.assessmentTemplateItem.create({
          data: {
            sectionId: section.id,
            code: itemData.code,
            question: itemData.question,
            description: itemData.description || undefined,
            responseType: itemData.responseType,
            isRequired: itemData.isRequired,
            displayOrder: itemData.displayOrder,
            responseOptions: itemData.responseOptions || undefined,
            minValue: itemData.minValue ?? undefined,
            maxValue: itemData.maxValue ?? undefined,
          },
        });
      }
    }

    // Count what was added
    const updatedTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: template.id },
      include: { sections: { include: { items: true } } },
    });

    const newTotalItems = updatedTemplate?.sections.reduce((sum, s) => sum + s.items.length, 0) || 0;
    console.log(`  ✓ Added ${updatedTemplate?.sections.length} sections with ${newTotalItems} items`);
  }

  console.log("\n✓ Done!");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
