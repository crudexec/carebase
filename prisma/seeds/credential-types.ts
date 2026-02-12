/**
 * Common Credential Types Seed Data
 *
 * Seeds standard credential types for home care agencies including:
 * - Licenses (CNA, LPN, RN)
 * - Certifications (CPR, First Aid)
 * - Health requirements (TB Test, Physical)
 * - Training (HIPAA, Infection Control)
 */

import { PrismaClient, CredentialCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Common credential types for home care agencies
const COMMON_CREDENTIAL_TYPES = [
  // -------------------- Licenses --------------------
  {
    name: "Certified Nursing Assistant (CNA)",
    category: CredentialCategory.LICENSE,
    description: "State-issued certification to provide basic patient care under supervision of nursing staff",
    defaultValidityMonths: 24,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [60, 30, 14, 7],
  },
  {
    name: "Licensed Practical Nurse (LPN)",
    category: CredentialCategory.LICENSE,
    description: "State license to practice as a licensed practical/vocational nurse",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [90, 60, 30, 14],
  },
  {
    name: "Registered Nurse (RN)",
    category: CredentialCategory.LICENSE,
    description: "State license to practice as a registered nurse",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [90, 60, 30, 14],
  },
  {
    name: "Home Health Aide (HHA)",
    category: CredentialCategory.LICENSE,
    description: "Certification to provide home health aide services",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: ["CARER"],
    reminderDays: [60, 30, 14, 7],
  },
  {
    name: "Driver's License",
    category: CredentialCategory.LICENSE,
    description: "Valid driver's license for transportation duties",
    defaultValidityMonths: 48,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [60, 30, 14],
  },

  // -------------------- Certifications --------------------
  {
    name: "CPR/BLS Certification",
    category: CredentialCategory.CERTIFICATION,
    description: "American Heart Association CPR/Basic Life Support certification",
    defaultValidityMonths: 24,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [60, 30, 14, 7],
  },
  {
    name: "First Aid Certification",
    category: CredentialCategory.CERTIFICATION,
    description: "Standard first aid certification from accredited provider",
    defaultValidityMonths: 24,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [60, 30, 14, 7],
  },
  {
    name: "AED Certification",
    category: CredentialCategory.CERTIFICATION,
    description: "Automated External Defibrillator certification",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [60, 30, 14],
  },
  {
    name: "Medication Administration Certification",
    category: CredentialCategory.CERTIFICATION,
    description: "Certification to administer medications in home care settings",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [60, 30, 14, 7],
  },

  // -------------------- Health Requirements --------------------
  {
    name: "TB Test (PPD/Chest X-Ray)",
    category: CredentialCategory.HEALTH,
    description: "Tuberculosis screening - PPD skin test or chest X-ray",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [30, 14, 7],
  },
  {
    name: "Physical Examination",
    category: CredentialCategory.HEALTH,
    description: "Annual physical examination clearance for work",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [30, 14, 7],
  },
  {
    name: "Hepatitis B Vaccination",
    category: CredentialCategory.HEALTH,
    description: "Hepatitis B vaccination series or declination",
    defaultValidityMonths: 0, // Does not expire once completed
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [],
  },
  {
    name: "Flu Vaccination",
    category: CredentialCategory.HEALTH,
    description: "Annual influenza vaccination",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [30, 14],
  },
  {
    name: "COVID-19 Vaccination",
    category: CredentialCategory.HEALTH,
    description: "COVID-19 vaccination record",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [30, 14],
  },
  {
    name: "Drug Screening",
    category: CredentialCategory.HEALTH,
    description: "Pre-employment or periodic drug screening",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [30, 14],
  },

  // -------------------- Training --------------------
  {
    name: "HIPAA Training",
    category: CredentialCategory.TRAINING,
    description: "Health Insurance Portability and Accountability Act training",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER", "STAFF", "SUPERVISOR"],
    reminderDays: [30, 14, 7],
  },
  {
    name: "Infection Control Training",
    category: CredentialCategory.TRAINING,
    description: "Infection prevention and control training",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [30, 14, 7],
  },
  {
    name: "Abuse/Neglect Recognition Training",
    category: CredentialCategory.TRAINING,
    description: "Training on recognizing and reporting abuse, neglect, and exploitation",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER", "STAFF", "SUPERVISOR"],
    reminderDays: [30, 14, 7],
  },
  {
    name: "Fire Safety Training",
    category: CredentialCategory.TRAINING,
    description: "Fire safety and emergency evacuation training",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [30, 14],
  },
  {
    name: "Dementia Care Training",
    category: CredentialCategory.TRAINING,
    description: "Specialized training for caring for clients with dementia",
    defaultValidityMonths: 24,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [60, 30, 14],
  },
  {
    name: "Body Mechanics/Safe Lifting",
    category: CredentialCategory.TRAINING,
    description: "Training on proper body mechanics and safe patient handling",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: ["CARER"],
    reminderDays: [30, 14],
  },

  // -------------------- Compliance --------------------
  {
    name: "Background Check",
    category: CredentialCategory.COMPLIANCE,
    description: "Criminal background check clearance",
    defaultValidityMonths: 24,
    isRequired: true,
    requiredForRoles: ["CARER", "STAFF", "SUPERVISOR"],
    reminderDays: [60, 30, 14],
  },
  {
    name: "OIG/LEIE Exclusion Check",
    category: CredentialCategory.COMPLIANCE,
    description: "Office of Inspector General exclusion list verification",
    defaultValidityMonths: 12,
    isRequired: true,
    requiredForRoles: ["CARER", "STAFF", "SUPERVISOR"],
    reminderDays: [30, 14],
  },
  {
    name: "Sex Offender Registry Check",
    category: CredentialCategory.COMPLIANCE,
    description: "Sex offender registry clearance",
    defaultValidityMonths: 24,
    isRequired: true,
    requiredForRoles: ["CARER"],
    reminderDays: [60, 30, 14],
  },
  {
    name: "I-9 Employment Verification",
    category: CredentialCategory.COMPLIANCE,
    description: "Employment eligibility verification",
    defaultValidityMonths: 0, // Does not expire
    isRequired: true,
    requiredForRoles: [],
    reminderDays: [],
  },
  {
    name: "Auto Insurance",
    category: CredentialCategory.COMPLIANCE,
    description: "Valid auto insurance for employees who drive for work",
    defaultValidityMonths: 12,
    isRequired: false,
    requiredForRoles: [],
    reminderDays: [30, 14, 7],
  },
];

async function seedCredentialTypes() {
  console.log("Starting credential types seed...");

  // Get all active companies
  const companies = await prisma.company.findMany({
    where: { isActive: true },
  });

  if (companies.length === 0) {
    console.log("No active companies found. Please run the main seed first.");
    return;
  }

  console.log(`Found ${companies.length} active companies`);

  for (const company of companies) {
    console.log(`\nSeeding credential types for: ${company.name}`);

    for (const credentialType of COMMON_CREDENTIAL_TYPES) {
      // Check if this credential type already exists for this company
      const existing = await prisma.credentialType.findFirst({
        where: {
          companyId: company.id,
          name: credentialType.name,
        },
      });

      if (existing) {
        console.log(`  ⏭️  ${credentialType.name} already exists`);
        continue;
      }

      await prisma.credentialType.create({
        data: {
          ...credentialType,
          companyId: company.id,
          isActive: true,
        },
      });

      console.log(`  ✅ Created: ${credentialType.name}`);
    }
  }

  console.log("\nCredential types seed completed successfully!");
}

// Export for use in main seed file
export { seedCredentialTypes };

// Run if called directly
if (require.main === module) {
  seedCredentialTypes()
    .catch((e) => {
      console.error("Error seeding credential types:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
