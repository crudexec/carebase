import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

function parseRoles(value: string | null) {
  if (!value) return undefined;
  const roles = value.split(",").map((role) => role.trim()).filter(Boolean);
  const validRoles = new Set(Object.values(UserRole));
  return roles.filter((role): role is UserRole => validRoles.has(role as UserRole));
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roles = parseRoles(searchParams.get("role"));
    const search = searchParams.get("search")?.trim();
    const active = searchParams.get("active");

    const users = await prisma.user.findMany({
      where: {
        companyId,
        ...(active === "false" ? {} : { isActive: true }),
        ...(roles?.length ? { role: { in: roles } } : {}),
        ...(search ? {
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
        role: true,
        isActive: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 200,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
