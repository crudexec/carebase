/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { newEnforcer } = require("casbin");
const { PrismaAdapter } = require("casbin-prisma-adapter");

const prisma = new PrismaClient();

async function fixAdminPermissions() {
  try {
    console.log("Fixing admin permissions...");

    // Get the enforcer
    const a = await PrismaAdapter.newAdapter();
    const e = await newEnforcer("model.conf", a);

    // Find all admin users (users with 'admin' in their email)
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: "admin",
        },
      },
      include: {
        UserProvider: true,
      },
    });

    console.log(`Found ${adminUsers.length} admin users`);

    for (const user of adminUsers) {
      console.log(`\nProcessing user: ${user.email}`);

      if (user.UserProvider && user.UserProvider.length > 0) {
        const providerId = user.UserProvider[0].providerId;

        // Remove any existing policies for this user
        await e.removeFilteredPolicy(0, user.id);

        // Add administrator role for the user
        const added = await e.addPolicy(user.id, "administrator", providerId);

        if (added) {
          console.log(`✅ Added administrator role for ${user.email}`);
        } else {
          console.log(
            `⚠️  Administrator role already exists for ${user.email}`,
          );
        }

        // Also add admin group policy
        await e.addGroupingPolicy("administrator", "all", providerId);

        // Save the policies
        await e.savePolicy();

        console.log(`✅ Permissions fixed for ${user.email}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Provider ID: ${providerId}`);
        console.log(`   Role: administrator`);
      } else {
        console.log(`⚠️  No provider found for ${user.email}`);
      }
    }

    // Also check for any caregivers and set their roles
    const caregivers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "nurse" } },
          { email: { contains: "caregiver" } },
          { jobTitle: { contains: "Nurse" } },
        ],
      },
      include: {
        UserProvider: true,
      },
    });

    console.log(`\nFound ${caregivers.length} caregiver users`);

    for (const user of caregivers) {
      console.log(`\nProcessing caregiver: ${user.email}`);

      if (user.UserProvider && user.UserProvider.length > 0) {
        const providerId = user.UserProvider[0].providerId;

        // Remove any existing policies for this user
        await e.removeFilteredPolicy(0, user.id);

        // Add caregiver role for the user
        const added = await e.addPolicy(user.id, "caregiver", providerId);

        if (added) {
          console.log(`✅ Added caregiver role for ${user.email}`);
        } else {
          console.log(`⚠️  Caregiver role already exists for ${user.email}`);
        }

        // Save the policies
        await e.savePolicy();

        console.log(`✅ Permissions fixed for ${user.email}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Provider ID: ${providerId}`);
        console.log(`   Role: caregiver`);
      }
    }

    // List all current policies
    console.log("\n=== Current Policies ===");
    const allPolicies = await e.getPolicy();
    console.log("Policies:", allPolicies);

    const allGroupingPolicies = await e.getGroupingPolicy();
    console.log("Grouping Policies:", allGroupingPolicies);

    console.log("\n========================================");
    console.log("✅ Permissions have been fixed!");
    console.log("========================================");
    console.log("Admin users can now access the dashboard.");
    console.log("Caregiver users can access the EVV page.");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions()
  .then(() => {
    console.log("✅ Permission fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Permission fix failed:", error.message);
    process.exit(1);
  });
