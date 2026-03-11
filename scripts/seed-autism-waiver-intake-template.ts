import { PrismaClient, AssessmentResponseType, AssessmentSectionType, ScoringMethod } from "@prisma/client";

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

  console.log(`Creating Autism Waiver Intake template for company: ${company.name}`);

  // Check if template already exists
  const existingTemplate = await prisma.assessmentTemplate.findFirst({
    where: {
      companyId: company.id,
      name: "Autism Waiver Client Intake",
    },
  });

  if (existingTemplate) {
    console.log("Template already exists, deleting and recreating...");
    // Delete in order: responses -> items -> sections -> template
    await prisma.assessmentResponse.deleteMany({
      where: {
        item: {
          section: {
            templateId: existingTemplate.id,
          },
        },
      },
    });
    await prisma.assessmentTemplateItem.deleteMany({
      where: {
        section: {
          templateId: existingTemplate.id,
        },
      },
    });
    await prisma.assessmentTemplateSection.deleteMany({
      where: { templateId: existingTemplate.id },
    });
    await prisma.assessmentTemplate.delete({
      where: { id: existingTemplate.id },
    });
  }

  // Create the template
  const template = await prisma.assessmentTemplate.create({
    data: {
      companyId: company.id,
      name: "Autism Waiver Client Intake",
      description:
        "Comprehensive intake assessment for autism waiver services. Captures client demographics, contacts, medical information, and behavioral profile across 11 modular sections.",
      version: 1,
      isActive: true,
      isRequired: false,
      displayOrder: 10,
      scoringMethod: ScoringMethod.SUM,
      sections: {
        create: [
          // Section 1: Client Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Client Information",
            description: "Basic demographic information about the client",
            instructions: "Complete all required fields. SSN and Medicaid numbers should be entered without dashes.",
            displayOrder: 0,
            items: {
              create: [
                {
                  code: "CLIENT_FIRST_NAME",
                  question: "First Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: true,
                },
                {
                  code: "CLIENT_MIDDLE_NAME",
                  question: "Middle Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "CLIENT_LAST_NAME",
                  question: "Last Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 2,
                  isRequired: true,
                },
                {
                  code: "CLIENT_PREFERRED_NAME",
                  question: "Preferred Name / Nickname",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "CLIENT_DOB",
                  question: "Date of Birth",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 4,
                  isRequired: true,
                },
                {
                  code: "CLIENT_GENDER",
                  question: "Gender",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 5,
                  isRequired: true,
                  responseOptions: [
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "non_binary", label: "Non-Binary" },
                    { value: "other", label: "Other" },
                    { value: "prefer_not_to_say", label: "Prefer Not to Say" },
                  ],
                },
                {
                  code: "CLIENT_SSN",
                  question: "Social Security Number",
                  description: "Enter 9 digits without dashes (e.g., 123456789)",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "CLIENT_MEDICAID_NUMBER",
                  question: "Medicaid Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 7,
                  isRequired: true,
                },
                {
                  code: "CLIENT_STREET_ADDRESS",
                  question: "Street Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 8,
                  isRequired: true,
                },
                {
                  code: "CLIENT_CITY",
                  question: "City",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 9,
                  isRequired: true,
                },
                {
                  code: "CLIENT_STATE",
                  question: "State",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 10,
                  isRequired: true,
                  responseOptions: [
                    { value: "MD", label: "Maryland" },
                    { value: "VA", label: "Virginia" },
                    { value: "DC", label: "Washington D.C." },
                    { value: "PA", label: "Pennsylvania" },
                    { value: "DE", label: "Delaware" },
                    { value: "WV", label: "West Virginia" },
                  ],
                },
                {
                  code: "CLIENT_ZIP",
                  question: "ZIP Code",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 11,
                  isRequired: true,
                },
                {
                  code: "CLIENT_COUNTY",
                  question: "County",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 12,
                  isRequired: false,
                },
                {
                  code: "CLIENT_PRIMARY_PHONE",
                  question: "Primary Phone Number",
                  description: "Enter 10 digits (e.g., 3015551234)",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 13,
                  isRequired: true,
                },
                {
                  code: "CLIENT_SECONDARY_PHONE",
                  question: "Secondary Phone Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 14,
                  isRequired: false,
                },
                {
                  code: "CLIENT_EMAIL",
                  question: "Email Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 15,
                  isRequired: false,
                },
                {
                  code: "CLIENT_PROFILE_PHOTO",
                  question: "Client Photo",
                  description: "Upload a recent photo of the client",
                  responseType: AssessmentResponseType.PHOTO,
                  displayOrder: 16,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 2: Admission Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Admission Information",
            description: "POC authorization and waiver service details",
            instructions: "Enter the authorization details and service information.",
            displayOrder: 1,
            items: {
              create: [
                {
                  code: "ADMISSION_DATE",
                  question: "Admission Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 0,
                  isRequired: true,
                },
                {
                  code: "SERVICE_START_DATE",
                  question: "Service Start Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 1,
                  isRequired: true,
                },
                {
                  code: "POC_AUTHORIZATION_NUMBER",
                  question: "POC Authorization Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "WAIVER_SERVICES",
                  question: "Waiver Services Authorized",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 3,
                  isRequired: true,
                  responseOptions: [
                    { value: "iiss", label: "IISS (Intensive Individual Support Services)" },
                    { value: "fc", label: "Family Consultation" },
                    { value: "iti", label: "Individual Therapeutic Integration" },
                    { value: "alp", label: "ALP (Adaptive Living Program)" },
                    { value: "respite", label: "Respite Care" },
                    { value: "family_training", label: "Family Training" },
                    { value: "transportation", label: "Transportation" },
                  ],
                },
                {
                  code: "AUTHORIZATION_START_DATE",
                  question: "Authorization Start Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "AUTHORIZATION_END_DATE",
                  question: "Authorization End Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "AUTHORIZED_HOURS_PER_WEEK",
                  question: "Authorized Hours Per Week",
                  responseType: AssessmentResponseType.NUMBER,
                  displayOrder: 6,
                  isRequired: false,
                  minValue: 0,
                  maxValue: 168,
                },
                {
                  code: "ADMISSION_NOTES",
                  question: "Additional Admission Notes",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 7,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 3: Mother/Guardian Contact Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Mother/Guardian Contact Information",
            description: "Primary guardian or mother contact details",
            displayOrder: 2,
            items: {
              create: [
                {
                  code: "MOTHER_FIRST_NAME",
                  question: "First Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: false,
                },
                {
                  code: "MOTHER_LAST_NAME",
                  question: "Last Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "MOTHER_RELATIONSHIP",
                  question: "Relationship to Client",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 2,
                  isRequired: false,
                  responseOptions: [
                    { value: "mother", label: "Mother" },
                    { value: "stepmother", label: "Stepmother" },
                    { value: "adoptive_mother", label: "Adoptive Mother" },
                    { value: "grandmother", label: "Grandmother" },
                    { value: "legal_guardian", label: "Legal Guardian" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "MOTHER_PHONE",
                  question: "Phone Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "MOTHER_EMAIL",
                  question: "Email Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "MOTHER_ADDRESS",
                  question: "Street Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "MOTHER_CITY",
                  question: "City",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "MOTHER_STATE",
                  question: "State",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 7,
                  isRequired: false,
                },
                {
                  code: "MOTHER_ZIP",
                  question: "ZIP Code",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 8,
                  isRequired: false,
                },
                {
                  code: "MOTHER_IS_EMERGENCY_CONTACT",
                  question: "Is this person an emergency contact?",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 9,
                  isRequired: false,
                },
                {
                  code: "MOTHER_IS_PRIMARY_CONTACT",
                  question: "Is this the primary contact?",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 10,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 4: Father/Guardian Contact Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Father/Guardian Contact Information",
            description: "Secondary guardian or father contact details",
            displayOrder: 3,
            items: {
              create: [
                {
                  code: "FATHER_FIRST_NAME",
                  question: "First Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: false,
                },
                {
                  code: "FATHER_LAST_NAME",
                  question: "Last Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "FATHER_RELATIONSHIP",
                  question: "Relationship to Client",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 2,
                  isRequired: false,
                  responseOptions: [
                    { value: "father", label: "Father" },
                    { value: "stepfather", label: "Stepfather" },
                    { value: "adoptive_father", label: "Adoptive Father" },
                    { value: "grandfather", label: "Grandfather" },
                    { value: "legal_guardian", label: "Legal Guardian" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "FATHER_PHONE",
                  question: "Phone Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "FATHER_EMAIL",
                  question: "Email Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "FATHER_ADDRESS",
                  question: "Street Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "FATHER_CITY",
                  question: "City",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "FATHER_STATE",
                  question: "State",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 7,
                  isRequired: false,
                },
                {
                  code: "FATHER_ZIP",
                  question: "ZIP Code",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 8,
                  isRequired: false,
                },
                {
                  code: "FATHER_IS_EMERGENCY_CONTACT",
                  question: "Is this person an emergency contact?",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 9,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 5: School Contact Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "School Contact Information",
            description: "Client's school or educational program information",
            displayOrder: 4,
            items: {
              create: [
                {
                  code: "SCHOOL_NAME",
                  question: "School / Program Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_ADDRESS",
                  question: "School Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_CITY",
                  question: "City",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_STATE",
                  question: "State",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_ZIP",
                  question: "ZIP Code",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_PHONE",
                  question: "School Phone",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_CONTACT_NAME",
                  question: "Contact Person Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_CONTACT_TITLE",
                  question: "Contact Person Title",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 7,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_CONTACT_EMAIL",
                  question: "Contact Person Email",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 8,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_GRADE_LEVEL",
                  question: "Grade Level / Program Type",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 9,
                  isRequired: false,
                  responseOptions: [
                    { value: "prek", label: "Pre-K" },
                    { value: "elementary", label: "Elementary (K-5)" },
                    { value: "middle", label: "Middle School (6-8)" },
                    { value: "high", label: "High School (9-12)" },
                    { value: "transition", label: "Transition Program (18-21)" },
                    { value: "adult_program", label: "Adult Day Program" },
                    { value: "home_school", label: "Home School" },
                    { value: "not_enrolled", label: "Not Currently Enrolled" },
                  ],
                },
                {
                  code: "SCHOOL_IEP",
                  question: "Does the client have an IEP (Individualized Education Plan)?",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 10,
                  isRequired: false,
                },
                {
                  code: "SCHOOL_NOTES",
                  question: "Additional School/Program Notes",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 11,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 6: Emergency Contact Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Emergency Contact Information",
            description: "Additional emergency contact (other than guardians)",
            displayOrder: 5,
            items: {
              create: [
                {
                  code: "EMERGENCY_FIRST_NAME",
                  question: "First Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_LAST_NAME",
                  question: "Last Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_RELATIONSHIP",
                  question: "Relationship to Client",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_PRIMARY_PHONE",
                  question: "Primary Phone",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_SECONDARY_PHONE",
                  question: "Secondary Phone",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_EMAIL",
                  question: "Email Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_ADDRESS",
                  question: "Address",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "EMERGENCY_CAN_PICKUP",
                  question: "Authorized to pick up client?",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 7,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 7: Medical Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Medical Information",
            description: "Diagnoses, allergies, medications, and medical equipment",
            instructions: "Provide comprehensive medical history including all diagnoses and current treatments.",
            displayOrder: 6,
            items: {
              create: [
                {
                  code: "PRIMARY_DIAGNOSIS",
                  question: "Primary Diagnosis (ICD-10)",
                  responseType: AssessmentResponseType.ICD10_DIAGNOSIS,
                  displayOrder: 0,
                  isRequired: true,
                },
                {
                  code: "SECONDARY_DIAGNOSES",
                  question: "Secondary Diagnoses",
                  description: "List any additional diagnoses",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "AUTISM_SEVERITY",
                  question: "Autism Severity Level (DSM-5)",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 2,
                  isRequired: false,
                  responseOptions: [
                    { value: "level1", label: "Level 1 - Requiring Support" },
                    { value: "level2", label: "Level 2 - Requiring Substantial Support" },
                    { value: "level3", label: "Level 3 - Requiring Very Substantial Support" },
                    { value: "unknown", label: "Unknown / Not Documented" },
                  ],
                },
                {
                  code: "ALLERGIES",
                  question: "Known Allergies",
                  description: "List all food, medication, and environmental allergies",
                  responseType: AssessmentResponseType.LIST,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "CURRENT_MEDICATIONS",
                  question: "Current Medications",
                  description: "List all medications including name, dose, and frequency",
                  responseType: AssessmentResponseType.REPEATER,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "MEDICAL_EQUIPMENT",
                  question: "Medical Equipment / Assistive Devices",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 5,
                  isRequired: false,
                  responseOptions: [
                    { value: "wheelchair", label: "Wheelchair" },
                    { value: "walker", label: "Walker" },
                    { value: "aac_device", label: "AAC Device" },
                    { value: "hearing_aids", label: "Hearing Aids" },
                    { value: "glasses", label: "Glasses" },
                    { value: "feeding_tube", label: "Feeding Tube" },
                    { value: "oxygen", label: "Oxygen" },
                    { value: "weighted_vest", label: "Weighted Vest" },
                    { value: "sensory_items", label: "Sensory Items" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "MEDICAL_EQUIPMENT_OTHER",
                  question: "Other Medical Equipment (specify)",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "PRIMARY_CARE_PHYSICIAN",
                  question: "Primary Care Physician Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 7,
                  isRequired: false,
                },
                {
                  code: "PCP_PHONE",
                  question: "Primary Care Physician Phone",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 8,
                  isRequired: false,
                },
                {
                  code: "SPECIALIST_INFO",
                  question: "Specialists (Neurologist, Psychiatrist, etc.)",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 9,
                  isRequired: false,
                },
                {
                  code: "MEDICAL_NOTES",
                  question: "Additional Medical Notes",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 10,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 8: Service Coordinator Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Service Coordinator Information",
            description: "DDA Service Coordinator or Case Manager details",
            displayOrder: 7,
            items: {
              create: [
                {
                  code: "SC_NAME",
                  question: "Service Coordinator Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 0,
                  isRequired: false,
                },
                {
                  code: "SC_ORGANIZATION",
                  question: "Organization / Agency",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "SC_PHONE",
                  question: "Phone Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "SC_FAX",
                  question: "Fax Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "SC_EMAIL",
                  question: "Email Address",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "SC_ADDRESS",
                  question: "Office Address",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 5,
                  isRequired: false,
                },
                {
                  code: "CASE_NUMBER",
                  question: "DDA Case Number",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 6,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 9: Referral Information
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Referral Information",
            description: "Source and details of the referral",
            displayOrder: 8,
            items: {
              create: [
                {
                  code: "REFERRAL_SOURCE",
                  question: "Referral Source",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 0,
                  isRequired: false,
                  responseOptions: [
                    { value: "dda", label: "DDA / State Agency" },
                    { value: "service_coordinator", label: "Service Coordinator" },
                    { value: "school", label: "School / IEP Team" },
                    { value: "physician", label: "Physician" },
                    { value: "family", label: "Family / Self-Referral" },
                    { value: "other_provider", label: "Other Provider" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "REFERRAL_SOURCE_OTHER",
                  question: "If Other, please specify",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "REFERRAL_DATE",
                  question: "Referral Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "REFERRAL_CONTACT_NAME",
                  question: "Referral Contact Name",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "REFERRAL_CONTACT_PHONE",
                  question: "Referral Contact Phone",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "REFERRAL_REASON",
                  question: "Reason for Referral",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 5,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 10: More About the Client
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "More About the Client",
            description: "Communication, behaviors, interests, and daily living skills",
            instructions: "This section helps staff understand the client's preferences, communication style, and behavioral patterns.",
            displayOrder: 9,
            items: {
              create: [
                {
                  code: "COMMUNICATION_STYLE",
                  question: "Primary Communication Methods",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 0,
                  isRequired: false,
                  responseOptions: [
                    { value: "verbal", label: "Verbal / Spoken Language" },
                    { value: "limited_verbal", label: "Limited Verbal" },
                    { value: "nonverbal", label: "Non-Verbal" },
                    { value: "sign_language", label: "Sign Language" },
                    { value: "aac_device", label: "AAC Device / Tablet" },
                    { value: "pecs", label: "PECS (Picture Exchange)" },
                    { value: "gestures", label: "Gestures / Pointing" },
                    { value: "communication_board", label: "Communication Board" },
                  ],
                },
                {
                  code: "COMMUNICATION_NOTES",
                  question: "Communication Notes",
                  description: "Describe how the client best communicates their needs",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 1,
                  isRequired: false,
                },
                {
                  code: "PREFERRED_ACTIVITIES",
                  question: "Preferred Activities / Interests",
                  responseType: AssessmentResponseType.LIST,
                  displayOrder: 2,
                  isRequired: false,
                },
                {
                  code: "DISLIKES_TRIGGERS",
                  question: "Dislikes / Potential Triggers",
                  responseType: AssessmentResponseType.LIST,
                  displayOrder: 3,
                  isRequired: false,
                },
                {
                  code: "CALMING_STRATEGIES",
                  question: "Effective Calming Strategies",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "BEHAVIORAL_CHALLENGES",
                  question: "Behavioral Challenges",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 5,
                  isRequired: false,
                  responseOptions: [
                    { value: "aggression", label: "Aggression (toward others)" },
                    { value: "self_injury", label: "Self-Injurious Behavior" },
                    { value: "property_destruction", label: "Property Destruction" },
                    { value: "elopement", label: "Elopement / Running Away" },
                    { value: "pica", label: "Pica (eating non-food items)" },
                    { value: "tantrums", label: "Tantrums / Meltdowns" },
                    { value: "non_compliance", label: "Non-Compliance" },
                    { value: "stereotypy", label: "Stereotypic Behaviors (stimming)" },
                    { value: "none", label: "None Reported" },
                  ],
                },
                {
                  code: "BEHAVIORAL_NOTES",
                  question: "Behavioral Notes",
                  description: "Additional details about behaviors and recommended responses",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 6,
                  isRequired: false,
                },
                {
                  code: "STRENGTHS",
                  question: "Client Strengths",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 7,
                  isRequired: false,
                },
                {
                  code: "DAILY_LIVING_SKILLS",
                  question: "Current Daily Living Skills",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 8,
                  isRequired: false,
                  responseOptions: [
                    { value: "toileting_independent", label: "Toileting - Independent" },
                    { value: "toileting_assistance", label: "Toileting - Needs Assistance" },
                    { value: "dressing_independent", label: "Dressing - Independent" },
                    { value: "dressing_assistance", label: "Dressing - Needs Assistance" },
                    { value: "eating_independent", label: "Eating - Independent" },
                    { value: "eating_assistance", label: "Eating - Needs Assistance" },
                    { value: "hygiene_independent", label: "Hygiene - Independent" },
                    { value: "hygiene_assistance", label: "Hygiene - Needs Assistance" },
                  ],
                },
                {
                  code: "SENSORY_NEEDS",
                  question: "Sensory Needs / Preferences",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 9,
                  isRequired: false,
                },
                {
                  code: "SLEEP_PATTERNS",
                  question: "Sleep Patterns",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 10,
                  isRequired: false,
                },
                {
                  code: "DIETARY_PREFERENCES",
                  question: "Dietary Preferences / Restrictions",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 11,
                  isRequired: false,
                },
              ],
            },
          },

          // Section 11: Intake Information & Signatures
          {
            sectionType: AssessmentSectionType.CUSTOM,
            title: "Intake Information & Signatures",
            description: "Intake completion details and required signatures",
            displayOrder: 10,
            items: {
              create: [
                {
                  code: "INTAKE_DATE",
                  question: "Intake Date",
                  responseType: AssessmentResponseType.DATE,
                  displayOrder: 0,
                  isRequired: true,
                },
                {
                  code: "INTAKE_CONDUCTED_BY",
                  question: "Intake Conducted By",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 1,
                  isRequired: true,
                },
                {
                  code: "INTAKE_ATTENDEES",
                  question: "Who was present at the intake?",
                  responseType: AssessmentResponseType.MULTIPLE_CHOICE,
                  displayOrder: 2,
                  isRequired: false,
                  responseOptions: [
                    { value: "client", label: "Client" },
                    { value: "mother", label: "Mother / Female Guardian" },
                    { value: "father", label: "Father / Male Guardian" },
                    { value: "both_parents", label: "Both Parents/Guardians" },
                    { value: "sibling", label: "Sibling(s)" },
                    { value: "service_coordinator", label: "Service Coordinator" },
                    { value: "therapist", label: "Therapist" },
                    { value: "teacher", label: "Teacher" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "INTAKE_LOCATION",
                  question: "Intake Location",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 3,
                  isRequired: false,
                  responseOptions: [
                    { value: "client_home", label: "Client's Home" },
                    { value: "office", label: "Office" },
                    { value: "virtual", label: "Virtual / Video Call" },
                    { value: "school", label: "School" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  code: "INTAKE_NOTES",
                  question: "Intake Notes",
                  responseType: AssessmentResponseType.TEXT_LONG,
                  displayOrder: 4,
                  isRequired: false,
                },
                {
                  code: "PARENT_GUARDIAN_NAME",
                  question: "Parent/Guardian Name (for signature)",
                  responseType: AssessmentResponseType.TEXT_SHORT,
                  displayOrder: 5,
                  isRequired: true,
                },
                {
                  code: "PARENT_GUARDIAN_RELATIONSHIP",
                  question: "Relationship to Client",
                  responseType: AssessmentResponseType.SINGLE_CHOICE,
                  displayOrder: 6,
                  isRequired: true,
                  responseOptions: [
                    { value: "parent", label: "Parent" },
                    { value: "legal_guardian", label: "Legal Guardian" },
                    { value: "power_of_attorney", label: "Power of Attorney" },
                    { value: "self", label: "Self (if adult client)" },
                  ],
                },
                {
                  code: "PARENT_GUARDIAN_SIGNATURE",
                  question: "Parent/Guardian Signature",
                  description: "By signing, you confirm that the information provided is accurate to the best of your knowledge.",
                  responseType: AssessmentResponseType.SIGNATURE,
                  displayOrder: 7,
                  isRequired: true,
                },
                {
                  code: "STAFF_SIGNATURE",
                  question: "Staff Signature",
                  responseType: AssessmentResponseType.SIGNATURE,
                  displayOrder: 8,
                  isRequired: true,
                },
                {
                  code: "CONSENT_SERVICES",
                  question: "I consent to receiving autism waiver services from this provider",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 9,
                  isRequired: true,
                },
                {
                  code: "CONSENT_INFORMATION_SHARING",
                  question: "I consent to the sharing of information with the DDA and service coordinator",
                  responseType: AssessmentResponseType.YES_NO,
                  displayOrder: 10,
                  isRequired: true,
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
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  console.log(`\n✅ Created Autism Waiver Intake template: ${template.name}`);
  console.log(`Template ID: ${template.id}`);
  console.log(`Sections: ${template.sections.length}`);
  console.log(
    `Total items: ${template.sections.reduce((acc, s) => acc + s.items.length, 0)}`
  );
  console.log("\nSections:");
  template.sections.forEach((section) => {
    console.log(`  ${section.displayOrder + 1}. ${section.title} (${section.items.length} items)`);
  });

  console.log("\n✅ Autism Waiver Intake template seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
