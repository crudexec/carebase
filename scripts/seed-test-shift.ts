/**
 * Seed script to create test data for Check In/Out feature
 *
 * Run with: npx tsx scripts/seed-test-shift.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test data for Check In/Out feature...\n");

  // 0. Create or find default company
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
    console.log("✓ Created demo company\n");
  }

  // 1. Create or find a test carer
  const carerEmail = "testcarer@carebase.com";
  let carer = await prisma.user.findUnique({ where: { email: carerEmail } });

  if (!carer) {
    const passwordHash = await bcrypt.hash("password123", 10);
    carer = await prisma.user.create({
      data: {
        companyId: company.id,
        email: carerEmail,
        passwordHash,
        firstName: "Test",
        lastName: "Carer",
        role: "CARER",
        isActive: true,
      },
    });
    console.log("✓ Created test carer:");
  } else {
    console.log("✓ Found existing test carer:");
  }
  console.log(`  Email: ${carerEmail}`);
  console.log(`  Password: password123\n`);

  // 2. Create or find a test client
  let client = await prisma.client.findFirst({
    where: { firstName: "Test", lastName: "Client" },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        companyId: company.id,
        firstName: "Test",
        lastName: "Client",
        address: "123 Test Street, Test City",
        phone: "555-0100",
        status: "ACTIVE",
      },
    });
    console.log("✓ Created test client\n");
  } else {
    console.log("✓ Found existing test client\n");
  }

  // 3. Create a shift for today
  const today = new Date();
  const shiftStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
  const shiftEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0);

  // Check if shift already exists for today
  const existingShift = await prisma.shift.findFirst({
    where: {
      carerId: carer.id,
      clientId: client.id,
      scheduledStart: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
    },
  });

  if (existingShift) {
    // Reset the shift to SCHEDULED status for testing
    await prisma.shift.update({
      where: { id: existingShift.id },
      data: {
        status: "SCHEDULED",
        actualStart: null,
        actualEnd: null,
      },
    });
    console.log("✓ Reset existing shift to SCHEDULED status\n");
  } else {
    await prisma.shift.create({
      data: {
        companyId: company.id,
        scheduledStart: shiftStart,
        scheduledEnd: shiftEnd,
        status: "SCHEDULED",
        carerId: carer.id,
        clientId: client.id,
      },
    });
    console.log("✓ Created shift for today\n");
  }

  console.log("=".repeat(50));
  console.log("\nTest data ready! To test the Check In/Out feature:\n");
  console.log("1. Start the dev server: npm run dev");
  console.log("2. Go to: http://localhost:3000/login");
  console.log(`3. Log in with:`);
  console.log(`   Email: ${carerEmail}`);
  console.log(`   Password: password123`);
  console.log("4. Navigate to: /check-in");
  console.log("5. You should see today's shift and can test check-in/out\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
