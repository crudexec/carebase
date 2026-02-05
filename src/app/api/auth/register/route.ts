import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      // Company fields for admin registration
      companyName,
      companyAddress,
      companyPhone,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Company name is required for registration (creates new company)
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required to register" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name: companyName,
          address: companyAddress || null,
          phone: companyPhone || null,
          isActive: true,
        },
      });

      // Create user as ADMIN of the new company
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone: phone || null,
          passwordHash,
          role: UserRole.ADMIN, // Company creator is admin
          isActive: true,
          companyId: company.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        },
      });

      // Log the registration (for audit trail)
      await tx.auditLog.create({
        data: {
          userId: user.id,
          companyId: company.id,
          action: "COMPANY_CREATED",
          entityType: "Company",
          entityId: company.id,
          changes: { companyName: company.name, adminEmail: user.email },
        },
      });

      return { user, company };
    });

    // Send welcome email
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [result.user.id],
      data: {
        firstName,
        email: email.toLowerCase(),
        tempPassword: "", // Empty - user set their own password
        loginUrl: `${appUrl}/login`,
      },
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return NextResponse.json(
      {
        message: "Account and company created successfully",
        user: result.user,
        company: {
          id: result.company.id,
          name: result.company.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
