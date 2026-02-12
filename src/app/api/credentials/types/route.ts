import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CredentialCategory } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  category: z.nativeEnum(CredentialCategory).optional(),
  isRequired: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

// Create credential type schema
const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.nativeEnum(CredentialCategory),
  description: z.string().optional(),
  defaultValidityMonths: z.number().int().min(1).default(24),
  isRequired: z.boolean().default(false),
  requiredForRoles: z.array(z.string()).default([]),
  reminderDays: z.array(z.number().int().min(1)).default([60, 30, 7]),
  isActive: z.boolean().default(true),
});

// GET - List credential types
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // All authenticated users can view credential types
    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]) || role === "CARER";

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, isRequired, isActive } = queryResult.data;

    const credentialTypes = await prisma.credentialType.findMany({
      where: {
        companyId,
        ...(category && { category }),
        ...(isRequired !== undefined && { isRequired: isRequired === "true" }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      },
      orderBy: [
        { isRequired: "desc" },
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ credentialTypes });
  } catch (error) {
    console.error("Error fetching credential types:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential types" },
      { status: 500 }
    );
  }
}

// POST - Create credential type
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Only admins can create credential types
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if credential type with same name already exists
    const existing = await prisma.credentialType.findUnique({
      where: {
        companyId_name: {
          companyId,
          name: result.data.name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A credential type with this name already exists" },
        { status: 409 }
      );
    }

    const credentialType = await prisma.credentialType.create({
      data: {
        ...result.data,
        companyId,
      },
    });

    return NextResponse.json({ credentialType }, { status: 201 });
  } catch (error) {
    console.error("Error creating credential type:", error);
    return NextResponse.json(
      { error: "Failed to create credential type" },
      { status: 500 }
    );
  }
}
