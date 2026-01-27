/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const { newEnforcer } = require("casbin");
const { PrismaAdapter } = require("casbin-prisma-adapter");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const enforcer = async () => {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer("model.conf", a);
  return e;
};

async function createNewAdminUser() {
  try {
    console.log("Creating new admin account with demo data...");

    // Generate timestamp for unique email
    const timestamp = Date.now();
    const uniqueEmail = `admin_${timestamp}@demo.com`;
    const password = "Admin@2024!";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if provider exists or create a new one
    let provider = await prisma.provider.findFirst({
      where: {
        providerName: "Demo Healthcare Organization",
      },
    });

    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          providerName: "Demo Healthcare Organization",
          email: "contact@demo.com",
          phone: "555-0100",
          address1: "123 Demo Street",
          city: "Demo City",
          state: "DC",
          zipCode: "12345",
          active: true,
        },
      });
      console.log("Created provider:", provider.providerName);
    } else {
      console.log("Using existing provider:", provider.providerName);
    }

    // Create new admin user with more demo data
    const adminUser = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Smith",
        email: uniqueEmail,
        password: hashedPassword,
        phone: "555-1234",
        dateOfBirth: new Date("1985-06-15"),
        gender: "Male",
        address1: "456 Admin Lane",
        address2: "Suite 200",
        city: "Healthcare City",
        state: "HC",
        zipCode: "54321",
        emergencyContactName: "Jane Smith",
        emergencyContactPhone: "555-5678",
        emergencyContactRelationship: "Spouse",
        preferredLanguage: "English",
        active: true,
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });

    console.log("Created new admin user:", adminUser.email);

    // Set up admin permissions with Casbin
    const e = await enforcer();

    // Add admin role with all permissions
    await e.addGroupingPolicy("Admin", "all", provider.id);
    await e.addPolicy(adminUser.id, "Admin", provider.id);

    // Save the policies
    await e.savePolicy();

    console.log("Admin permissions configured successfully");

    // Create some additional demo data for this admin

    // Create a sample care team member
    const careTeamMember = await prisma.user.create({
      data: {
        firstName: "Emily",
        lastName: "Johnson",
        email: `nurse_${timestamp}@demo.com`,
        password: hashedPassword,
        phone: "555-2345",
        dateOfBirth: new Date("1990-03-22"),
        gender: "Female",
        address1: "789 Medical Center Blvd",
        city: "Healthcare City",
        state: "HC",
        zipCode: "54321",
        active: true,
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });

    // Set nurse permissions
    await e.addPolicy(careTeamMember.id, "Nurse", provider.id);
    await e.savePolicy();

    console.log("Created care team member:", careTeamMember.email);

    // Create a sample patient
    const patient = await prisma.user.create({
      data: {
        firstName: "Robert",
        lastName: "Williams",
        email: `patient_${timestamp}@demo.com`,
        password: hashedPassword,
        phone: "555-3456",
        dateOfBirth: new Date("1955-11-30"),
        gender: "Male",
        address1: "321 Oak Street",
        city: "Hometown",
        state: "HT",
        zipCode: "67890",
        emergencyContactName: "Mary Williams",
        emergencyContactPhone: "555-7890",
        emergencyContactRelationship: "Wife",
        preferredLanguage: "English",
        active: true,
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });

    // Set patient permissions
    await e.addPolicy(patient.id, "Patient", provider.id);
    await e.savePolicy();

    console.log("Created patient:", patient.email);

    // Create sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointment1 = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        providerId: provider.id,
        careTeamMemberId: careTeamMember.id,
        appointmentDate: tomorrow,
        appointmentType: "Home Visit",
        status: "Scheduled",
        duration: 60,
        notes: "Routine health check-up and medication review",
        reasonForVisit: "Regular monthly check-up",
      },
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointment2 = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        providerId: provider.id,
        careTeamMemberId: careTeamMember.id,
        appointmentDate: nextWeek,
        appointmentType: "Follow-up",
        status: "Scheduled",
        duration: 30,
        notes: "Blood pressure monitoring",
        reasonForVisit: "Follow-up for hypertension management",
      },
    });

    console.log("Created sample appointments");

    // Create sample medical records
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        providerId: provider.id,
        recordDate: new Date(),
        recordType: "General Health Assessment",
        diagnosis: "Hypertension, Type 2 Diabetes",
        treatment: "Medication management, dietary counseling",
        medications: "Metformin 1000mg twice daily, Lisinopril 10mg once daily",
        notes:
          "Patient showing good compliance with medication regimen. Blood pressure stable.",
        vitalSigns: JSON.stringify({
          bloodPressure: "130/80",
          heartRate: 72,
          temperature: "98.6F",
          weight: "180 lbs",
          height: "5'10\"",
          bmi: 25.8,
        }),
      },
    });

    console.log("Created sample medical record");

    console.log("\n========================================");
    console.log("New Admin Account Created Successfully!");
    console.log("========================================");
    console.log("ADMIN ACCOUNT:");
    console.log(`Email: ${uniqueEmail}`);
    console.log(`Password: ${password}`);
    console.log("Provider: Demo Healthcare Organization");
    console.log("");
    console.log("CARE TEAM MEMBER ACCOUNT:");
    console.log(`Email: nurse_${timestamp}@demo.com`);
    console.log(`Password: ${password}`);
    console.log("");
    console.log("PATIENT ACCOUNT:");
    console.log(`Email: patient_${timestamp}@demo.com`);
    console.log(`Password: ${password}`);
    console.log("");
    console.log("Demo Data Created:");
    console.log("- 2 Appointments scheduled");
    console.log("- 1 Medical record");
    console.log("- Complete user profiles with addresses");
    console.log("========================================\n");
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createNewAdminUser()
  .then(() => {
    console.log("Setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
