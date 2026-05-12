import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireInternalAdmin } from "@/lib/internal-admin";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  faxNumber: z.string().optional().nullable(),
  currency: z.enum(["USD", "GBP", "CAD", "NGN"]).default("USD"),
  adminInviteEmail: z.string().email().optional().nullable(),
  expiresInDays: z.number().min(1).max(30).default(7),
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

    const { name, address, phone, faxNumber, currency, adminInviteEmail, expiresInDays } =
      validation.data;

    if (faxNumber && !/^\+?[1-9]\d{1,14}$/.test(faxNumber.trim())) {
      return NextResponse.json(
        { error: "Fax number must be in E.164 format (e.g., +12025551234)" },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

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

      let invite = null;
      let inviteUrl: string | null = null;

      if (adminInviteEmail) {
        invite = await tx.invite.create({
          data: {
            email: adminInviteEmail.toLowerCase(),
            role: UserRole.ADMIN,
            expiresAt,
            companyId: company.id,
            createdById: session.user.id,
          },
        });

        const appUrl =
          process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
        inviteUrl = `${appUrl}/register/invite?token=${invite.token}`;
      }

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
            adminInviteEmail: adminInviteEmail || null,
          },
        },
      });

      return { company, invite, inviteUrl };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
