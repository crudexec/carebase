import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedMarylandConfiguration } from "./seeds/maryland-state-config";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding database...");

  // Default password for all test users
  const defaultPassword = await hashPassword("Password123!");

  // Create or get default company
  let company = await prisma.company.findFirst({
    where: { name: "CareBase Demo Company" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "CareBase Demo Company",
        address: "123 Demo Street, Test City, TC 12345",
        phone: "+1234567000",
        isActive: true,
      },
    });
    console.log(`  ✅ Created company: ${company.name}`);
  } else {
    console.log(`  ⏭️  Company ${company.name} already exists, skipping...`);
  }

  // Create test users for each role
  const users = [
    {
      email: "admin@carebase.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      phone: "+1234567890",
    },
    {
      email: "ops@carebase.com",
      firstName: "Operations",
      lastName: "Manager",
      role: UserRole.OPS_MANAGER,
      phone: "+1234567891",
    },
    {
      email: "clinical@carebase.com",
      firstName: "Clinical",
      lastName: "Director",
      role: UserRole.CLINICAL_DIRECTOR,
      phone: "+1234567892",
    },
    {
      email: "staff@carebase.com",
      firstName: "Staff",
      lastName: "Member",
      role: UserRole.STAFF,
      phone: "+1234567893",
    },
    {
      email: "supervisor@carebase.com",
      firstName: "Field",
      lastName: "Supervisor",
      role: UserRole.SUPERVISOR,
      phone: "+1234567894",
    },
    {
      email: "carer@carebase.com",
      firstName: "John",
      lastName: "Caregiver",
      role: UserRole.CARER,
      phone: "+1234567895",
    },
    {
      email: "sponsor@carebase.com",
      firstName: "Jane",
      lastName: "Sponsor",
      role: UserRole.SPONSOR,
      phone: "+1234567896",
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`  ⏭️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: defaultPassword,
        isActive: true,
        companyId: company.id,
      },
    });

    console.log(`  ✅ Created ${user.role}: ${user.email}`);

    // Create CaregiverProfile for CARER role
    if (user.role === UserRole.CARER) {
      await prisma.caregiverProfile.create({
        data: {
          userId: user.id,
          certifications: ["CPR", "First Aid", "CNA"],
          healthStatus: "Cleared",
          emergencyContact: "+1987654321",
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
      });
      console.log(`  ✅ Created CaregiverProfile for ${user.email}`);
    }
  }

  // Create a test client (linked to sponsor and carer)
  const sponsor = await prisma.user.findUnique({
    where: { email: "sponsor@carebase.com" },
  });
  const carer = await prisma.user.findUnique({
    where: { email: "carer@carebase.com" },
  });

  if (sponsor && carer) {
    const existingClient = await prisma.client.findFirst({
      where: { sponsorId: sponsor.id },
    });

    if (!existingClient) {
      const client = await prisma.client.create({
        data: {
          companyId: company.id,
          firstName: "Alice",
          lastName: "Patient",
          dateOfBirth: new Date("1945-05-15"),
          address: "123 Care Street, Medical City, MC 12345",
          phone: "+1555123456",
          medicalNotes: "Requires assistance with daily activities. No known allergies.",
          status: "ACTIVE",
          sponsorId: sponsor.id,
          assignedCarerId: carer.id,
        },
      });

      console.log(`  ✅ Created test client: ${client.firstName} ${client.lastName}`);

      // Create onboarding record for the client
      await prisma.onboardingRecord.create({
        data: {
          companyId: company.id,
          clientId: client.id,
          stage: "CONTRACT_START",
          notes: "Onboarding completed",
          clinicalApproval: true,
        },
      });

      console.log(`  ✅ Created onboarding record for client`);
    } else {
      console.log(`  ⏭️  Test client already exists, skipping...`);
    }
  }

  // Seed Maryland state configuration
  console.log("\n🏛️  Seeding state configurations...");
  await seedMarylandConfiguration();

  console.log("\n✨ Seeding complete!");
  console.log("\n📋 Test Credentials:");
  console.log("   Email: admin@carebase.com");
  console.log("   Password: Password123!");
  console.log("\n   (Same password for all test users)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
