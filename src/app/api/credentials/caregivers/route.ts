import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId, role } = session.user;
    const canManageCredentials = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);
    const isCarer = role === UserRole.CARER;

    if (!canManageCredentials && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    if (!isCarer && (!search || search.length < 2)) {
      return NextResponse.json({ caregivers: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        role: UserRole.CARER,
        ...(isCarer ? { id: userId } : {}),
        ...(!isCarer && search ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        caregiverProfile: {
          select: { id: true },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 20,
    });

    return NextResponse.json({
      caregivers: users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        profileId: user.caregiverProfile?.id ?? user.id,
        hasProfile: Boolean(user.caregiverProfile),
      })),
    });
  } catch (error) {
    console.error("Error searching credential caregivers:", error);
    return NextResponse.json(
      { error: "Failed to search caregivers" },
      { status: 500 }
    );
  }
}
