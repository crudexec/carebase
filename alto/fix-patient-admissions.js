/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixPatientAdmissions() {
  try {
    console.log("Fixing patient admissions...\n");

    // Get all patients that don't have a patientAdmission record
    const patientsWithoutAdmission = await prisma.patient.findMany({
      where: {
        patientAdmission: {
          none: {},
        },
      },
      include: {
        patientAdmission: true,
      },
    });

    console.log(
      `Found ${patientsWithoutAdmission.length} patients without admission records\n`,
    );

    // Create patientAdmission records for each patient
    for (const patient of patientsWithoutAdmission) {
      // Use the patient's existing status or default to REFERRED
      const admissionStatus = patient.status || "REFERRED";

      const admission = await prisma.patientAdmission.create({
        data: {
          patientId: patient.id,
          status: admissionStatus,
          actionDate: patient.admissionSOC || patient.createdAt,
          certStartDate: patient.admissionSOC || patient.createdAt,
          certEndDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ), // 1 year from now
        },
      });

      console.log(
        `✅ Created admission for ${patient.firstName} ${patient.lastName} - Status: ${admissionStatus}`,
      );
    }

    // Get final count of patients by status
    const patientsByStatus = await prisma.patientAdmission.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    console.log("\n========================================");
    console.log("Patient Admission Status Summary:");
    console.log("========================================");

    patientsByStatus.forEach((group) => {
      console.log(`${group.status}: ${group._count.status} patients`);
    });

    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Error fixing patient admissions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPatientAdmissions()
  .then(() => {
    console.log("✅ Patient admission fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Patient admission fix failed:", error.message);
    process.exit(1);
  });
