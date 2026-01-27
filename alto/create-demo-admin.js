/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createDemoAdmin() {
  try {
    console.log("Creating new demo admin account...");

    // Generate unique email with timestamp
    const timestamp = Date.now();
    const adminEmail = `admin_${timestamp}@demo.com`;
    const password = "DemoAdmin@2024";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if provider exists or create new one
    let provider = await prisma.provider.findFirst({
      where: {
        providerName: "Demo Healthcare Provider",
      },
    });

    if (!provider) {
      provider = await prisma.provider.create({
        data: {
          providerName: "Demo Healthcare Provider",
          billingName: "Demo Healthcare Billing",
          providerNumber: "DEMO-" + timestamp,
          contact1: "555-0100",
          contact2: "555-0101",
          address1: "123 Healthcare Street",
          address2: "Suite 100",
          state: "CA",
          city: "Los Angeles",
          zipCode: "90001",
          phone: "555-0100",
          fax: "555-0102",
          email: "info@demohealthcare.com",
          npi: "1234567890",
          providerType: "HOMEHEALTH",
          active: true,
        },
      });
      console.log("✅ Created provider:", provider.providerName);
    } else {
      console.log("✅ Using existing provider:", provider.providerName);
    }

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Demo",
        lastName: "Admin",
        middleName: "Test",
        licenseNo: "ADM-" + timestamp,
        jobTitle: "System Administrator",
        addressLine1: "456 Admin Boulevard",
        addressLine2: "Office 200",
        state: "CA",
        city: "Los Angeles",
        postalCode: "90001",
        homePhone: "555-1234",
        cellPhone: "555-5678",
        memo: "Demo admin account for testing purposes",
        active: true,
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
      include: {
        UserProvider: true,
      },
    });

    console.log("✅ Created admin user:", adminUser.email);

    // Create a nurse/caregiver user
    const nurseEmail = `nurse_${timestamp}@demo.com`;
    const nurseUser = await prisma.user.create({
      data: {
        email: nurseEmail,
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Johnson",
        licenseNo: "RN-" + timestamp,
        jobTitle: "Registered Nurse",
        service: "G0151", // Speech therapy service type
        taxonomy: "Registered Nurse",
        taxonomyCode: "163W00000X",
        addressLine1: "789 Medical Plaza",
        state: "CA",
        city: "Los Angeles",
        postalCode: "90002",
        homePhone: "555-3456",
        cellPhone: "555-7890",
        memo: "Demo nurse account",
        active: true,
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });

    console.log("✅ Created nurse user:", nurseUser.email);

    // Create a patient
    const patientData = await prisma.patient.create({
      data: {
        provider: {
          connect: { id: provider.id },
        },
        patientNo: "PT-" + timestamp,
        firstName: "John",
        lastName: "Doe",
        middleInitial: "M",
        gender: "MALE",
        address1: "321 Patient Lane",
        address2: "Apt 5B",
        state: "CA",
        city: "Los Angeles",
        zip: "90003",
        country: "USA",
        phone: "555-4567",
        maritalStatus: "MARRIED",
        race: "CAUCASIAN",
        medicareNumber: "MED123456789",
        medicaidNumber: "MCAID987654",
        status: "ACTIVE",
        dob: new Date("1955-03-15"),
        ssn: "123-45-6789",
        referralSource: "Hospital Referral",
        employmentStatus: "RETIRED",
      },
    });

    console.log(
      "✅ Created patient:",
      patientData.firstName + " " + patientData.lastName,
    );

    // Create sample schedules
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const schedule1 = await prisma.patientSchedule.create({
      data: {
        patient: { connect: { id: patientData.id } },
        provider: { connect: { id: provider.id } },
        caregiver: { connect: { id: nurseUser.id } },
        appointmentStartTime: tomorrow,
        appointmentEndTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
        service: "Skilled Nursing Visit",
        caregiverComments: "Routine health assessment and medication review",
        visitStatus: "UNASSIGNED",
        status: "Scheduled",
        active: true,
      },
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const schedule2 = await prisma.patientSchedule.create({
      data: {
        patient: { connect: { id: patientData.id } },
        provider: { connect: { id: provider.id } },
        caregiver: { connect: { id: nurseUser.id } },
        appointmentStartTime: nextWeek,
        appointmentEndTime: new Date(nextWeek.getTime() + 60 * 60 * 1000), // 1 hour later
        service: "Physical Therapy",
        caregiverComments: "Physical therapy session - mobility exercises",
        visitStatus: "UNASSIGNED",
        status: "Scheduled",
        active: true,
      },
    });

    console.log("✅ Created sample schedules");

    // Display credentials
    console.log("\n========================================");
    console.log("🎉 Demo Accounts Created Successfully!");
    console.log("========================================\n");

    console.log("📋 ADMIN ACCOUNT:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${password}`);
    console.log("   Role: System Administrator\n");

    console.log("👩‍⚕️ NURSE ACCOUNT:");
    console.log(`   Email: ${nurseEmail}`);
    console.log(`   Password: ${password}`);
    console.log("   Role: Registered Nurse\n");

    console.log("🏥 PATIENT RECORD:");
    console.log(`   Name: ${patientData.firstName} ${patientData.lastName}`);
    console.log(`   Patient Number: ${patientData.patientNo}`);
    console.log(`   Medicare Number: ${patientData.medicareNumber}\n`);

    console.log("📅 SCHEDULED VISITS:");
    console.log(
      `   - ${tomorrow.toLocaleDateString()} at ${tomorrow.toLocaleTimeString()} (Skilled Nursing)`,
    );
    console.log(
      `   - ${nextWeek.toLocaleDateString()} at ${nextWeek.toLocaleTimeString()} (Physical Therapy)\n`,
    );

    console.log("Provider: Demo Healthcare Provider");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Error creating demo accounts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAdmin()
  .then(() => {
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  });
