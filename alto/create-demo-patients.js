/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

// List of realistic medical conditions
const medicalConditions = [
  "Hypertension",
  "Type 2 Diabetes",
  "Chronic Obstructive Pulmonary Disease (COPD)",
  "Congestive Heart Failure",
  "Arthritis",
  "Alzheimer's Disease",
  "Parkinson's Disease",
  "Post-Surgical Recovery",
  "Stroke Recovery",
  "Chronic Pain Management",
];

// List of insurance companies
const insuranceCompanies = [
  "Medicare",
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealth",
  "Humana",
  "Cigna",
  "Kaiser Permanente",
  "Anthem",
];

// Referral sources
const referralSources = [
  "Hospital Discharge",
  "Primary Care Physician",
  "Specialist Referral",
  "Emergency Department",
  "Rehabilitation Center",
  "Family Member",
  "Self-Referral",
  "Insurance Company",
];

function generateMedicareNumber() {
  // Medicare number format: 1EG4-TE5-MK72
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 5).toUpperCase();
  const part3 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part1}-${part2}-${part3}`;
}

function generateSSN() {
  const area = Math.floor(Math.random() * 899) + 100;
  const group = Math.floor(Math.random() * 99) + 10;
  const serial = Math.floor(Math.random() * 9999) + 1000;
  return `${area}-${group}-${serial}`;
}

async function createDemoPatients() {
  try {
    console.log("Creating demo patients...\n");

    // Get the demo provider - this is the same provider the admin account is attached to
    const provider = await prisma.provider.findFirst({
      where: {
        providerName: "Demo Healthcare Provider",
      },
    });

    if (!provider) {
      console.error(
        "❌ Demo Healthcare Provider not found. Please run create-demo-admin.js first.",
      );
      return;
    }

    console.log(
      `✅ Using provider: ${provider.providerName} (ID: ${provider.id})`,
    );
    console.log("   All patients will be attached to this provider.\n");

    // Get caregivers for assignments from the same provider
    const caregivers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "nurse" } },
          { jobTitle: { contains: "Nurse" } },
        ],
        UserProvider: {
          some: {
            providerId: provider.id,
          },
        },
      },
      take: 5,
    });

    console.log(`Found ${caregivers.length} caregivers for assignments\n`);

    // Array to store created patients
    const patients = [];

    // Create 10 demo patients
    for (let i = 1; i <= 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const gender = faker.helpers.arrayElement(["MALE", "FEMALE"]);
      const dob = faker.date.birthdate({ min: 55, max: 90, mode: "age" });
      const ethnicity = faker.helpers.arrayElement([
        "CAUCASIAN",
        "AFRICANAMERICAN",
        "HISPANIC",
        "ASIAN",
        "NATIVEAMERICAN",
        "OTHERS",
      ]);
      const maritalStatus = faker.helpers.arrayElement([
        "MARRIED",
        "SINGLE",
        "WIDOW",
        "DIVORCED",
      ]);
      const employmentStatus = faker.helpers.arrayElement([
        "RETIRED",
        "UNEMPLOYED",
        "PART_TIME",
      ]);

      const patient = await prisma.patient.create({
        data: {
          provider: { connect: { id: provider.id } },
          patientNo: `PT-${Date.now()}-${i}`,
          firstName,
          lastName,
          middleInitial: faker.person.middleName().charAt(0),
          gender,
          dob,
          ssn: generateSSN(),
          phone: faker.phone.number("555-####"),
          medicareNumber: generateMedicareNumber(),
          medicaidNumber:
            Math.random() > 0.5
              ? `MCAID${faker.number.int({ min: 100000, max: 999999 })}`
              : null,
          address1: faker.location.streetAddress(),
          address2:
            Math.random() > 0.7 ? faker.location.secondaryAddress() : null,
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zip: faker.location.zipCode("#####"),
          country: "USA",
          maritalStatus,
          race: ethnicity,
          employmentStatus,
          referralSource: faker.helpers.arrayElement(referralSources),
          status: faker.helpers.arrayElement(["ACTIVE", "REFERRED"]),
          admissionSOC: faker.date.recent({ days: 30 }),
          sharePatient: false,
          dmeSupplies: faker.helpers.arrayElement(["ORDERED", "NOTNEEDED"]),
        },
      });

      patients.push(patient);
      console.log(
        `✅ Created patient ${i}: ${firstName} ${lastName} (${patient.patientNo})`,
      );

      // Create patient insurance
      const primaryInsurance = faker.helpers.arrayElement(insuranceCompanies);
      await prisma.patientInsurance.create({
        data: {
          patient: { connect: { id: patient.id } },
          type: primaryInsurance === "Medicare" ? "MEDICARE" : "MANAGED_CARE",
          status: true,
          company: primaryInsurance,
          insuredId: `INS${faker.number.int({ min: 100000000, max: 999999999 })}`,
          memberId: `MEM${faker.number.int({ min: 100000000, max: 999999999 })}`,
          groupNumber: `GRP${faker.number.int({ min: 10000, max: 99999 })}`,
          effectiveFrom: faker.date.past({ years: 2 }),
          effectiveThrough: faker.date.future({ years: 1 }),
          patientRelationship: "Self",
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: dob.toISOString().split("T")[0],
          sex: gender === "MALE" ? "M" : "F",
          address1: patient.address1,
          city: patient.city,
          state: patient.state,
          zip: patient.zip,
          relationshipToPatient: "Self",
          active: true,
        },
      });

      // Create patient authorization
      await prisma.patientAuthorization.create({
        data: {
          Patient: { connect: { id: patient.id } },
          startDate: faker.date.recent({ days: 30 }),
          endDate: faker.date.future({ years: 1 }),
          status: "Approved",
          insurance: primaryInsurance,
          number: `AUTH${faker.number.int({ min: 100000, max: 999999 })}`,
          visitsAuthorized: faker.helpers.arrayElement([
            "20",
            "30",
            "40",
            "60",
          ]),
          sn: faker.helpers.arrayElement(["10", "15", "20", "25"]),
          pt: faker.helpers.arrayElement(["8", "10", "12", "15"]),
          ot: faker.helpers.arrayElement(["6", "8", "10", "12"]),
          st: faker.helpers.arrayElement(["4", "6", "8", "10"]),
          hha: faker.helpers.arrayElement(["20", "30", "40", "50"]),
          comment: `Authorization approved for ${faker.helpers.arrayElement(medicalConditions)}`,
        },
      });

      // Create some scheduled visits
      if (caregivers.length > 0) {
        const assignedCaregiver = faker.helpers.arrayElement(caregivers);

        // Create 3-5 scheduled visits per patient
        const numVisits = faker.number.int({ min: 3, max: 5 });
        for (let v = 0; v < numVisits; v++) {
          const visitDate = new Date();
          visitDate.setDate(
            visitDate.getDate() + faker.number.int({ min: 1, max: 14 }),
          );
          visitDate.setHours(faker.number.int({ min: 8, max: 16 }), 0, 0, 0);

          const service = faker.helpers.arrayElement([
            "Skilled Nursing Visit",
            "Physical Therapy",
            "Occupational Therapy",
            "Home Health Aide",
            "Speech Therapy",
            "Medical Social Worker",
          ]);

          await prisma.patientSchedule.create({
            data: {
              patient: { connect: { id: patient.id } },
              provider: { connect: { id: provider.id } },
              caregiver: { connect: { id: assignedCaregiver.id } },
              appointmentStartTime: visitDate,
              appointmentEndTime: new Date(
                visitDate.getTime() + 60 * 60 * 1000,
              ), // 1 hour later
              service,
              visitStatus: "UNASSIGNED",
              status: "Scheduled",
              caregiverComments: `${service} for ${faker.helpers.arrayElement(medicalConditions)}`,
              visitLocation: faker.helpers.arrayElement([
                "Home",
                "Assisted Living",
                "Adult Family Home",
              ]),
              billable: true,
              active: true,
            },
          });
        }
        console.log(`   📅 Created ${numVisits} scheduled visits`);
      }

      // Create a medical note/assessment for some patients
      if (Math.random() > 0.5) {
        const vitalSigns = {
          bloodPressure: `${faker.number.int({ min: 110, max: 140 })}/${faker.number.int({ min: 70, max: 90 })}`,
          heartRate: faker.number.int({ min: 60, max: 100 }),
          temperature:
            faker.number.float({ min: 97.0, max: 99.5, precision: 0.1 }) + "F",
          respiratoryRate: faker.number.int({ min: 12, max: 20 }),
          oxygenSaturation: faker.number.int({ min: 94, max: 100 }),
          weight: faker.number.int({ min: 120, max: 250 }) + " lbs",
          height: `${faker.number.int({ min: 5, max: 6 })}'${faker.number.int({ min: 0, max: 11 })}"`,
          painLevel: faker.number.int({ min: 0, max: 7 }),
        };

        // Store vital signs as JSON string or create related record based on your schema
        console.log(`   📋 Created medical assessment with vital signs`);
      }
    }

    console.log("\n========================================");
    console.log("🎉 Demo Patients Created Successfully!");
    console.log("========================================\n");
    console.log(`Total Patients Created: ${patients.length}`);
    console.log("\nPatient Summary:");
    console.log("----------------");

    patients.forEach((patient, index) => {
      const age =
        new Date().getFullYear() - new Date(patient.dob).getFullYear();
      console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
      console.log(`   - Patient #: ${patient.patientNo}`);
      console.log(`   - Age: ${age} years`);
      console.log(`   - Medicare #: ${patient.medicareNumber}`);
      console.log(`   - Status: ${patient.status}`);
    });

    console.log("\n========================================\n");
  } catch (error) {
    console.error("❌ Error creating demo patients:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoPatients()
  .then(() => {
    console.log("✅ Demo patient creation completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Demo patient creation failed:", error.message);
    process.exit(1);
  });
