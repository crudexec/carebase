import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { newEnforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";

const prisma = new PrismaClient();

const enforcer = async () => {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer("model.conf", a);
  return e;
};

async function createAdminUser() {
  try {
    console.log("Creating demo admin account for staging branch...");

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@demo.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists with email: admin@demo.com");
      return;
    }

    // Create a demo provider (organization)
    const provider = await prisma.provider.create({
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

    // Create admin user with image
    const adminUser = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "Demo",
        email: "admin@demo.com",
        password: hashedPassword,
        active: true,
        image: {
          create: {
            src: "https://via.placeholder.com/150",
            mediaId: "admin-avatar-001",
            fileType: "IMG",
          },
        },
        UserProvider: {
          create: {
            providerId: provider.id,
          },
        },
      },
    });

    console.log("Created admin user:", adminUser.email);

    // Set up admin permissions with Casbin
    const e = await enforcer();

    // Create permission if doesn't exist
    let permission = await prisma.permission.findUnique({
      where: { name: "All" },
    });

    if (!permission) {
      permission = await prisma.permission.create({
        data: { name: "All" },
      });
    }

    // Add admin role with all permissions
    await e.addNamedPolicy("p", adminUser.id, "administrator", provider.id);
    await e.savePolicy();

    console.log("Admin permissions configured successfully");
    console.log("\n========================================");
    console.log("Demo Admin Account Created Successfully!");
    console.log("========================================");
    console.log("Email: admin@demo.com");
    console.log("Password: admin123");
    console.log("Provider: Demo Healthcare Organization");
    console.log("Role: Administrator (Full Access)");
    console.log("========================================\n");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log("Setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
