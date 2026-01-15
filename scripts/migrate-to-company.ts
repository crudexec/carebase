import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting company migration...");

  // Step 1: Create a default company
  console.log("Creating default company...");
  const defaultCompany = await prisma.$executeRaw`
    INSERT INTO "Company" (id, name, address, phone, "isActive", "createdAt", "updatedAt")
    VALUES (
      'default-company-001',
      'Default Company',
      NULL,
      NULL,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("Default company created or already exists");

  // Step 2: Add companyId column to tables (if not exists) and update existing records
  const tables = [
    "User",
    "Client",
    "Shift",
    "ShiftAttendance",
    "DailyReport",
    "IncidentReport",
    "PayrollRecord",
    "Invoice",
    "ChatMessage",
    "Escalation",
    "OnboardingRecord",
    "Notification",
    "AuditLog",
  ];

  for (const table of tables) {
    try {
      // Check if column exists first
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${table} AND column_name = 'companyId'
      `;

      if (Array.isArray(columnCheck) && columnCheck.length === 0) {
        console.log(`Adding companyId column to ${table}...`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "${table}"
          ADD COLUMN IF NOT EXISTS "companyId" TEXT
        `);
      }

      // Update all existing records to use default company
      console.log(`Updating ${table} records with default company...`);
      await prisma.$executeRawUnsafe(`
        UPDATE "${table}"
        SET "companyId" = 'default-company-001'
        WHERE "companyId" IS NULL
      `);

      console.log(`✓ ${table} updated`);
    } catch (error) {
      console.log(`Note: ${table} - ${error instanceof Error ? error.message : 'skipped'}`);
    }
  }

  console.log("\nMigration completed!");
  console.log("Now run: npx prisma db push");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
