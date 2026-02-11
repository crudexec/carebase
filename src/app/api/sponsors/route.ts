import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendNotification } from "@/lib/notifications";

const createSponsorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  clientId: z.string().optional().nullable(), // Optional: pre-assign to a client
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/sponsors - List sponsors
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { search, status, page, limit } = queryValidation.data;

    // Build query - scope to company and only SPONSOR role
    const where: Prisma.UserWhereInput = {
      companyId: session.user.companyId,
      role: "SPONSOR",
    };

    // Filter by status
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [sponsors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          sponsoredClients: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
        },
        orderBy: [{ isActive: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      sponsors: sponsors.map((s) => ({
        ...s,
        lastLogin: s.lastLogin?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
        clientCount: s.sponsoredClients.length,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}

// POST /api/sponsors - Create a new sponsor directly (with password)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createSponsorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, clientId } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Validate client if provided
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          companyId: session.user.companyId,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create sponsor user and optionally link to client
    const sponsor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId: session.user.companyId,
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          role: "SPONSOR",
          phone: phone || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Link to client if provided
      if (clientId) {
        await tx.client.update({
          where: { id: clientId },
          data: { sponsorId: user.id },
        });
      }

      return user;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SPONSOR_CREATED",
        entityType: "User",
        entityId: sponsor.id,
        changes: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          clientId: clientId || null,
        },
      },
    });

    // Send welcome email with login credentials
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [sponsor.id],
      data: {
        firstName,
        email: email.toLowerCase(),
        tempPassword: password,
        loginUrl: `${appUrl}/login`,
      },
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return NextResponse.json(
      {
        sponsor: {
          ...sponsor,
          lastLogin: null,
          createdAt: sponsor.createdAt.toISOString(),
          clientCount: clientId ? 1 : 0,
          sponsoredClients: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sponsor:", error);
    return NextResponse.json(
      { error: "Failed to create sponsor" },
      { status: 500 }
    );
  }
}
