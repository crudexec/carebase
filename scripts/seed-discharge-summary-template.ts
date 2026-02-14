/**
 * Seed script for Discharge Summary Assessment Template
 *
 * Run with: npx tsx scripts/seed-discharge-summary-template.ts
 */

import { PrismaClient, AssessmentSectionType, AssessmentResponseType, ScoringMethod } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating Discharge Summary Assessment Template...");

  // Check if template already exists
  const existing = await prisma.assessmentTemplate.findFirst({
    where: { name: "Discharge Summary" },
    include: { sections: true },
  });

  if (existing) {
    if (existing.sections.length > 0) {
      console.log("Discharge Summary template already exists with sections. Skipping...");
      return;
    }

    // Check if there are assessments using this template
    const assessmentsCount = await prisma.assessment.count({
      where: { templateId: existing.id },
    });

    if (assessmentsCount > 0) {
      console.log(`Found ${assessmentsCount} assessments using this template.`);
      console.log("Use the fix-discharge-summary-template.ts script instead to add sections to the existing template.");
      console.log("Run: npx tsx scripts/fix-discharge-summary-template.ts");
      return;
    }

    // Template exists but has no sections and no assessments - delete and recreate
    console.log("Found Discharge Summary template with no sections. Recreating...");
    await prisma.assessmentTemplate.delete({
      where: { id: existing.id },
    });
  }

  // Create the template with all sections and items
  const template = await prisma.assessmentTemplate.create({
    data: {
      name: "Discharge Summary",
      description: "Comprehensive discharge documentation confirming end of services, detailing patient care history, and providing follow-up instructions.",
      version: 1,
      isActive: true,
      isRequired: false,
      displayOrder: 10,
      scoringMethod: ScoringMethod.SUM,
      maxScore: null, // Not scored
      sections: {
        create: [
          // Section 1: Discharge Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Discharge Information",
            description: "Basic discharge details and reason for discharge",
            instructions: "Complete all fields accurately. Select the appropriate discharge reason.",
            displayOrder: 0,
            items: {
              create: [
                {
                  code: "DISCHARGE_DATE",
                  question: "Date of Discharge",
                  responseType: AssessmentResponseType.DATE,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "DISCHARGE_REASON",
                  question: "Reason for Discharge",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 1,
                  responseOptions: [
                    { value: "goals_met", label: "Goals Met / Treatment Complete", score: 0 },
                    { value: "transferred", label: "Transferred to Another Provider", score: 0 },
                    { value: "hospitalized", label: "Hospitalized", score: 0 },
                    { value: "moved", label: "Patient Moved Out of Service Area", score: 0 },
                    { value: "patient_request", label: "Patient/Family Request", score: 0 },
                    { value: "non_compliance", label: "Non-Compliance with Care Plan", score: 0 },
                    { value: "deceased", label: "Deceased", score: 0 },
                    { value: "insurance", label: "Insurance/Authorization Ended", score: 0 },
                    { value: "other", label: "Other", score: 0 },
                  ],
                },
                {
                  code: "DISCHARGE_DESTINATION",
                  question: "Discharge Destination",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 2,
                  responseOptions: [
                    { value: "home_self", label: "Home - Self Care", score: 0 },
                    { value: "home_family", label: "Home - Family/Caregiver Support", score: 0 },
                    { value: "home_other_agency", label: "Home - Another Home Health Agency", score: 0 },
                    { value: "snf", label: "Skilled Nursing Facility", score: 0 },
                    { value: "alf", label: "Assisted Living Facility", score: 0 },
                    { value: "hospital", label: "Hospital", score: 0 },
                    { value: "hospice", label: "Hospice", score: 0 },
                    { value: "rehab", label: "Rehabilitation Facility", score: 0 },
                    { value: "other", label: "Other", score: 0 },
                  ],
                },
                {
                  code: "DISCHARGE_REASON_NOTES",
                  question: "Additional Notes on Discharge Reason",
                  description: "Provide any additional context or explanation for the discharge",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 3,
                },
              ],
            },
          },

          // Section 2: Care Summary
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Care Summary",
            description: "Summary of services provided during the care period",
            instructions: "Document the care provided, including duration and frequency of services.",
            displayOrder: 1,
            items: {
              create: [
                {
                  code: "ADMISSION_DATE",
                  question: "Date of Admission",
                  responseType: AssessmentResponseType.DATE,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "LENGTH_OF_SERVICE",
                  question: "Total Length of Service (days)",
                  responseType: AssessmentResponseType.NUMBER,
                  isRequired: true,
                  displayOrder: 1,
                  minValue: 1,
                  maxValue: 9999,
                },
                {
                  code: "SERVICES_PROVIDED",
                  question: "Services Provided",
                  description: "Select all services that were provided during the care period",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: true,
                  displayOrder: 2,
                  responseOptions: [
                    { value: "skilled_nursing", label: "Skilled Nursing", score: 0 },
                    { value: "physical_therapy", label: "Physical Therapy", score: 0 },
                    { value: "occupational_therapy", label: "Occupational Therapy", score: 0 },
                    { value: "speech_therapy", label: "Speech Therapy", score: 0 },
                    { value: "home_health_aide", label: "Home Health Aide", score: 0 },
                    { value: "medical_social_work", label: "Medical Social Work", score: 0 },
                    { value: "wound_care", label: "Wound Care", score: 0 },
                    { value: "medication_management", label: "Medication Management", score: 0 },
                    { value: "disease_education", label: "Disease Education", score: 0 },
                    { value: "care_coordination", label: "Care Coordination", score: 0 },
                  ],
                },
                {
                  code: "PRIMARY_DIAGNOSIS",
                  question: "Primary Diagnosis",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 3,
                },
                {
                  code: "SECONDARY_DIAGNOSES",
                  question: "Secondary Diagnoses",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 4,
                },
                {
                  code: "CARE_SUMMARY_NARRATIVE",
                  question: "Summary of Care Provided",
                  description: "Provide a narrative summary of the care and interventions provided",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 5,
                },
              ],
            },
          },

          // Section 3: Clinical Status at Discharge
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Clinical Status at Discharge",
            description: "Patient's clinical condition at time of discharge",
            displayOrder: 2,
            items: {
              create: [
                {
                  code: "OVERALL_STATUS",
                  question: "Overall Clinical Status at Discharge",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 0,
                  responseOptions: [
                    { value: "improved", label: "Improved", score: 0 },
                    { value: "stabilized", label: "Stabilized", score: 0 },
                    { value: "declined", label: "Declined", score: 0 },
                    { value: "no_change", label: "No Significant Change", score: 0 },
                  ],
                },
                {
                  code: "GOALS_STATUS",
                  question: "Care Plan Goals Status",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 1,
                  responseOptions: [
                    { value: "all_met", label: "All Goals Met", score: 0 },
                    { value: "partially_met", label: "Goals Partially Met", score: 0 },
                    { value: "not_met", label: "Goals Not Met", score: 0 },
                    { value: "modified", label: "Goals Modified During Care", score: 0 },
                  ],
                },
                {
                  code: "VITAL_SIGNS_STABLE",
                  question: "Are vital signs stable at discharge?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 2,
                },
                {
                  code: "PAIN_LEVEL",
                  question: "Pain Level at Discharge (0-10)",
                  description: "0 = No pain, 10 = Worst pain imaginable",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 3,
                  minValue: 0,
                  maxValue: 10,
                },
                {
                  code: "WOUNDS_HEALED",
                  question: "If applicable, wound healing status",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: false,
                  displayOrder: 4,
                  responseOptions: [
                    { value: "fully_healed", label: "Fully Healed", score: 0 },
                    { value: "healing_well", label: "Healing Well / Improved", score: 0 },
                    { value: "no_change", label: "No Change", score: 0 },
                    { value: "worsened", label: "Worsened", score: 0 },
                    { value: "na", label: "Not Applicable", score: 0 },
                  ],
                },
                {
                  code: "CLINICAL_NOTES",
                  question: "Clinical Status Notes",
                  description: "Document any relevant clinical observations at discharge",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 5,
                },
              ],
            },
          },

          // Section 4: Functional Status Comparison
          {
            sectionType: AssessmentSectionType.KATZ_ADL,
            title: "Functional Status at Discharge",
            description: "ADL status at discharge compared to admission",
            instructions: "Rate the patient's current functional abilities. 0 = Dependent, 1 = Needs Assistance, 2 = Independent",
            displayOrder: 3,
            items: {
              create: [
                {
                  code: "ADL_BATHING",
                  question: "Bathing",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 0,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "ADL_DRESSING",
                  question: "Dressing",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 1,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "ADL_TOILETING",
                  question: "Toileting",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 2,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "ADL_TRANSFERRING",
                  question: "Transferring",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 3,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "ADL_CONTINENCE",
                  question: "Continence",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 4,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "ADL_FEEDING",
                  question: "Feeding",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 5,
                  minValue: 0,
                  maxValue: 2,
                  scoreMapping: { "0": 0, "1": 1, "2": 2 },
                },
                {
                  code: "MOBILITY_STATUS",
                  question: "Mobility/Ambulation Status",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 6,
                  responseOptions: [
                    { value: "independent", label: "Independent", score: 0 },
                    { value: "device", label: "Independent with Device", score: 0 },
                    { value: "supervision", label: "Requires Supervision", score: 0 },
                    { value: "assistance", label: "Requires Assistance", score: 0 },
                    { value: "dependent", label: "Dependent/Non-Ambulatory", score: 0 },
                  ],
                },
                {
                  code: "FUNCTIONAL_IMPROVEMENT",
                  question: "Overall Functional Improvement Since Admission",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 7,
                  responseOptions: [
                    { value: "significant", label: "Significant Improvement", score: 0 },
                    { value: "moderate", label: "Moderate Improvement", score: 0 },
                    { value: "minimal", label: "Minimal Improvement", score: 0 },
                    { value: "no_change", label: "No Change", score: 0 },
                    { value: "declined", label: "Declined", score: 0 },
                  ],
                },
              ],
            },
          },

          // Section 5: Medication Summary
          {
            sectionType: AssessmentSectionType.MEDICATION,
            title: "Medication Summary",
            description: "Current medications and changes made during care",
            displayOrder: 4,
            items: {
              create: [
                {
                  code: "MED_RECONCILIATION_DONE",
                  question: "Was medication reconciliation completed at discharge?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "MED_CHANGES",
                  question: "Were there medication changes during the care period?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 1,
                },
                {
                  code: "MED_CHANGES_SUMMARY",
                  question: "Summary of Medication Changes",
                  description: "List any medications that were started, stopped, or dose-adjusted",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 2,
                },
                {
                  code: "CURRENT_MEDICATIONS",
                  question: "Current Medication List at Discharge",
                  description: "List all current medications with dosages and frequencies",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 3,
                },
                {
                  code: "MED_COMPLIANCE",
                  question: "Patient Medication Compliance",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 4,
                  responseOptions: [
                    { value: "excellent", label: "Excellent - Always compliant", score: 0 },
                    { value: "good", label: "Good - Usually compliant", score: 0 },
                    { value: "fair", label: "Fair - Sometimes non-compliant", score: 0 },
                    { value: "poor", label: "Poor - Frequently non-compliant", score: 0 },
                  ],
                },
                {
                  code: "MED_EDUCATION_PROVIDED",
                  question: "Was medication education provided to patient/caregiver?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 5,
                },
              ],
            },
          },

          // Section 6: Follow-up Instructions
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Follow-up Instructions",
            description: "Post-discharge care instructions and follow-up appointments",
            displayOrder: 5,
            items: {
              create: [
                {
                  code: "FOLLOWUP_PHYSICIAN",
                  question: "Follow-up Physician Appointment Scheduled?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "FOLLOWUP_DATE",
                  question: "Follow-up Appointment Date (if scheduled)",
                  responseType: AssessmentResponseType.DATE,
                  isRequired: false,
                  displayOrder: 1,
                },
                {
                  code: "FOLLOWUP_PROVIDER",
                  question: "Follow-up Provider Name",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 2,
                },
                {
                  code: "DIET_INSTRUCTIONS",
                  question: "Dietary Instructions",
                  description: "Any special diet or nutritional instructions",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 3,
                },
                {
                  code: "ACTIVITY_INSTRUCTIONS",
                  question: "Activity/Exercise Instructions",
                  description: "Activity restrictions or recommended exercises",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 4,
                },
                {
                  code: "WARNING_SIGNS",
                  question: "Warning Signs to Watch For",
                  description: "Symptoms that should prompt the patient to seek medical attention",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 5,
                },
                {
                  code: "EMERGENCY_INSTRUCTIONS",
                  question: "Emergency Contact Instructions Provided?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 6,
                },
                {
                  code: "ADDITIONAL_INSTRUCTIONS",
                  question: "Additional Care Instructions",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 7,
                },
              ],
            },
          },

          // Section 7: Patient/Caregiver Education
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Patient/Caregiver Education",
            description: "Education provided to patient and/or caregiver",
            displayOrder: 6,
            items: {
              create: [
                {
                  code: "EDUCATION_TOPICS",
                  question: "Education Topics Covered",
                  description: "Select all topics that were taught during the care period",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: true,
                  displayOrder: 0,
                  responseOptions: [
                    { value: "disease_process", label: "Disease Process/Management", score: 0 },
                    { value: "medications", label: "Medication Management", score: 0 },
                    { value: "diet_nutrition", label: "Diet/Nutrition", score: 0 },
                    { value: "exercise", label: "Exercise/Activity", score: 0 },
                    { value: "wound_care", label: "Wound Care", score: 0 },
                    { value: "fall_prevention", label: "Fall Prevention", score: 0 },
                    { value: "safety", label: "Home Safety", score: 0 },
                    { value: "equipment", label: "Medical Equipment Use", score: 0 },
                    { value: "emergency", label: "Emergency Procedures", score: 0 },
                    { value: "community", label: "Community Resources", score: 0 },
                  ],
                },
                {
                  code: "EDUCATION_RECIPIENT",
                  question: "Who Received Education?",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: true,
                  displayOrder: 1,
                  responseOptions: [
                    { value: "patient", label: "Patient", score: 0 },
                    { value: "spouse", label: "Spouse/Partner", score: 0 },
                    { value: "child", label: "Adult Child", score: 0 },
                    { value: "other_family", label: "Other Family Member", score: 0 },
                    { value: "paid_caregiver", label: "Paid Caregiver", score: 0 },
                  ],
                },
                {
                  code: "EDUCATION_UNDERSTANDING",
                  question: "Patient/Caregiver Understanding of Instructions",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 2,
                  responseOptions: [
                    { value: "excellent", label: "Excellent - Demonstrates full understanding", score: 0 },
                    { value: "good", label: "Good - Understands most concepts", score: 0 },
                    { value: "fair", label: "Fair - Partial understanding, may need reinforcement", score: 0 },
                    { value: "poor", label: "Poor - Limited understanding, concerns noted", score: 0 },
                  ],
                },
                {
                  code: "WRITTEN_INSTRUCTIONS",
                  question: "Were written instructions provided?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 3,
                },
              ],
            },
          },

          // Section 8: Referrals & Recommendations
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Referrals & Recommendations",
            description: "Referrals to other providers and ongoing care recommendations",
            displayOrder: 7,
            items: {
              create: [
                {
                  code: "REFERRALS_MADE",
                  question: "Referrals Made",
                  description: "Select all referrals made for continued care",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  isRequired: false,
                  displayOrder: 0,
                  responseOptions: [
                    { value: "pcp", label: "Primary Care Physician", score: 0 },
                    { value: "specialist", label: "Medical Specialist", score: 0 },
                    { value: "pt_outpatient", label: "Outpatient Physical Therapy", score: 0 },
                    { value: "ot_outpatient", label: "Outpatient Occupational Therapy", score: 0 },
                    { value: "st_outpatient", label: "Outpatient Speech Therapy", score: 0 },
                    { value: "home_health", label: "Another Home Health Agency", score: 0 },
                    { value: "hospice", label: "Hospice", score: 0 },
                    { value: "social_services", label: "Social Services", score: 0 },
                    { value: "mental_health", label: "Mental Health Services", score: 0 },
                    { value: "dme", label: "Durable Medical Equipment", score: 0 },
                    { value: "none", label: "No Referrals Needed", score: 0 },
                  ],
                },
                {
                  code: "REFERRAL_DETAILS",
                  question: "Referral Details",
                  description: "Provide details about referrals including provider names and contact information",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 1,
                },
                {
                  code: "DME_NEEDS",
                  question: "Ongoing DME/Equipment Needs",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 2,
                },
                {
                  code: "COMMUNITY_RESOURCES",
                  question: "Community Resources Recommended",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 3,
                },
              ],
            },
          },

          // Section 9: Patient Satisfaction Survey
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Patient Satisfaction Survey",
            description: "Brief patient feedback on care received",
            instructions: "Ask the patient or caregiver to rate their experience",
            displayOrder: 8,
            items: {
              create: [
                {
                  code: "SATISFACTION_OVERALL",
                  question: "Overall satisfaction with care received",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 0,
                  minValue: 1,
                  maxValue: 5,
                  scoreMapping: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
                },
                {
                  code: "SATISFACTION_STAFF",
                  question: "Satisfaction with staff professionalism and courtesy",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 1,
                  minValue: 1,
                  maxValue: 5,
                  scoreMapping: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
                },
                {
                  code: "SATISFACTION_COMMUNICATION",
                  question: "Satisfaction with communication",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 2,
                  minValue: 1,
                  maxValue: 5,
                  scoreMapping: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
                },
                {
                  code: "SATISFACTION_TIMELINESS",
                  question: "Satisfaction with timeliness of care",
                  responseType: AssessmentResponseType.SCALE,
                  isRequired: true,
                  displayOrder: 3,
                  minValue: 1,
                  maxValue: 5,
                  scoreMapping: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
                },
                {
                  code: "WOULD_RECOMMEND",
                  question: "Would you recommend our services to others?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 4,
                },
                {
                  code: "PATIENT_COMMENTS",
                  question: "Additional Comments or Feedback",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 5,
                },
              ],
            },
          },

          // Section 10: Physician Communication
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Physician Communication",
            description: "Summary for referring/attending physician",
            displayOrder: 9,
            items: {
              create: [
                {
                  code: "PHYSICIAN_NOTIFIED",
                  question: "Was the attending physician notified of discharge?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "PHYSICIAN_NAME",
                  question: "Attending Physician Name",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 1,
                },
                {
                  code: "NOTIFICATION_METHOD",
                  question: "Method of Physician Notification",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  isRequired: true,
                  displayOrder: 2,
                  responseOptions: [
                    { value: "fax", label: "Fax", score: 0 },
                    { value: "phone", label: "Phone Call", score: 0 },
                    { value: "portal", label: "EHR/Portal Message", score: 0 },
                    { value: "mail", label: "Mail", score: 0 },
                    { value: "in_person", label: "In Person", score: 0 },
                  ],
                },
                {
                  code: "PHYSICIAN_SUMMARY",
                  question: "Physician Summary",
                  description: "Brief clinical summary for the physician record",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 3,
                },
                {
                  code: "ORDERS_RECEIVED",
                  question: "Were discharge orders received from physician?",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 4,
                },
              ],
            },
          },

          // Section 11: Discharge Signatures
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Discharge Acknowledgment",
            description: "Signatures and acknowledgments",
            displayOrder: 10,
            items: {
              create: [
                {
                  code: "PATIENT_ACKNOWLEDGMENT",
                  question: "Patient/Caregiver acknowledges receipt of discharge instructions",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 0,
                },
                {
                  code: "COPY_PROVIDED",
                  question: "Copy of discharge summary provided to patient/caregiver",
                  responseType: AssessmentResponseType.YES_NO,
                  isRequired: true,
                  displayOrder: 1,
                },
                {
                  code: "CLINICIAN_NAME",
                  question: "Discharging Clinician Name",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 2,
                },
                {
                  code: "CLINICIAN_CREDENTIALS",
                  question: "Clinician Credentials/Title",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: true,
                  displayOrder: 3,
                },
                {
                  code: "FINAL_NOTES",
                  question: "Final Notes",
                  description: "Any additional notes or comments regarding the discharge",
                  responseType: AssessmentResponseType.TEXT,
                  isRequired: false,
                  displayOrder: 4,
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
          items: true,
        },
      },
    },
  });

  console.log(`Created Discharge Summary template with ID: ${template.id}`);
  console.log(`  - ${template.sections.length} sections`);
  console.log(`  - ${template.sections.reduce((acc, s) => acc + s.items.length, 0)} total items`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
