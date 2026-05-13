import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireInternalAdmin } from "@/lib/internal-admin";
import { hashPassword, validatePassword } from "@/lib/password";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  faxNumber: z.string().optional().nullable(),
  currency: z.enum(["USD", "GBP", "CAD", "NGN"]).default("USD"),
  adminFirstName: z.string().min(1, "Admin first name is required").max(100),
  adminLastName: z.string().min(1, "Admin last name is required").max(100),
  adminEmail: z.string().email("A valid admin email is required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!requireInternalAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            invites: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!requireInternalAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createCompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      address,
      phone,
      faxNumber,
      currency,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
    } = validation.data;

    if (faxNumber && !/^\+?[1-9]\d{1,14}$/.test(faxNumber.trim())) {
      return NextResponse.json(
        { error: "Fax number must be in E.164 format (e.g., +12025551234)" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(adminPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || "Password does not meet requirements" },
        { status: 400 }
      );
    }

    const normalizedAdminEmail = adminEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedAdminEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin email is already in use" },
        { status: 400 }
      );
    }

    const adminPasswordHash = await hashPassword(adminPassword);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: name.trim(),
          address: address?.trim() || null,
          phone: phone?.trim() || null,
          faxNumber: faxNumber?.trim() || null,
          currency,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          companyId: company.id,
          email: normalizedAdminEmail,
          passwordHash: adminPasswordHash,
          firstName: adminFirstName.trim(),
          lastName: adminLastName.trim(),
          role: UserRole.ADMIN,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          companyId: company.id,
          action: "COMPANY_CREATED",
          entityType: "Company",
          entityId: company.id,
          changes: {
            name: company.name,
            address: company.address,
            phone: company.phone,
            faxNumber: company.faxNumber,
            currency: company.currency,
            createdByInternalAdminId: session.user.id,
            adminEmail: normalizedAdminEmail,
            adminFirstName: adminFirstName.trim(),
            adminLastName: adminLastName.trim(),
          },
        },
      });

      return { company, adminUser };
    });

    return NextResponse.json(
      {
        ...result,
        credentials: {
          email: normalizedAdminEmail,
          password: adminPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
