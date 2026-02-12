import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CredentialCategory } from "@prisma/client";

// Update credential type schema
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.nativeEnum(CredentialCategory).optional(),
  description: z.string().nullable().optional(),
  defaultValidityMonths: z.number().int().min(1).optional(),
  isRequired: z.boolean().optional(),
  requiredForRoles: z.array(z.string()).optional(),
  reminderDays: z.array(z.number().int().min(1)).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single credential type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]) || role === "CARER";

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const credentialType = await prisma.credentialType.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { credentials: true },
        },
      },
    });

    if (!credentialType) {
      return NextResponse.json(
        { error: "Credential type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ credentialType });
  } catch (error) {
    console.error("Error fetching credential type:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential type" },
      { status: 500 }
    );
  }
}

// PATCH - Update credential type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if credential type exists
    const existing = await prisma.credentialType.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Credential type not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If name is being changed, check for duplicates
    if (result.data.name && result.data.name !== existing.name) {
      const duplicate = await prisma.credentialType.findUnique({
        where: {
          companyId_name: {
            companyId,
            name: result.data.name,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A credential type with this name already exists" },
          { status: 409 }
        );
      }
    }

    const credentialType = await prisma.credentialType.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ credentialType });
  } catch (error) {
    console.error("Error updating credential type:", error);
    return NextResponse.json(
      { error: "Failed to update credential type" },
      { status: 500 }
    );
  }
}

// DELETE - Delete credential type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if credential type exists
    const existing = await prisma.credentialType.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { credentials: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Credential type not found" },
        { status: 404 }
      );
    }

    // Check if there are credentials using this type
    if (existing._count.credentials > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete credential type that is in use",
          details: `This credential type is used by ${existing._count.credentials} caregiver credential(s). Deactivate it instead.`
        },
        { status: 409 }
      );
    }

    await prisma.credentialType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credential type:", error);
    return NextResponse.json(
      { error: "Failed to delete credential type" },
      { status: 500 }
    );
  }
}
