import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendNotification } from "@/lib/notifications";

const createStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  role: z.nativeEnum(UserRole),
  phone: z.string().max(20).optional().nullable(),
  profileData: z.record(z.string(), z.any()).optional().nullable(),
});

const querySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Staff roles (excluding SPONSOR which is for clients)
const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "STAFF",
  "SUPERVISOR",
  "CARER",
];

// GET /api/staff - List staff members
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

    const { search, role, page, limit } = queryValidation.data;

    // Build query - scope to company and only staff roles
    const where: Prisma.UserWhereInput = {
      companyId: session.user.companyId,
      role: role ? role : { in: STAFF_ROLES },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profileData: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          caregiverProfile: {
            select: {
              id: true,
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
      staff: staff.map((s) => ({
        ...s,
        profileData: s.profileData || null,
        lastLogin: s.lastLogin?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
        caregiverProfile: s.caregiverProfile || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
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
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role, phone, profileData } = validation.data;

    // Validate role is a staff role
    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role for staff member" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        companyId: session.user.companyId,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        phone: phone || null,
        profileData: profileData ? (profileData as Prisma.InputJsonValue) : Prisma.DbNull,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        profileData: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "STAFF_CREATED",
        entityType: "User",
        entityId: user.id,
        changes: {
          email,
          firstName,
          lastName,
          role,
        },
      },
    });

    // Send welcome email with login credentials
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [user.id],
      data: {
        firstName,
        email,
        tempPassword: password, // Send the original password before hashing
        loginUrl: `${appUrl}/login`,
      },
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return NextResponse.json(
      {
        staff: {
          ...user,
          lastLogin: null,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating staff member:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}
