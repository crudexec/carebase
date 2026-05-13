import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;

    if (!companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_ADMINISTER)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        NOT: { id: userId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const witnesses = users
      .filter((user) =>
        hasPermission(user.role, PERMISSIONS.EMAR_NARCOTIC_WITNESS)
      )
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      }));

    return NextResponse.json({ witnesses });
  } catch (error) {
    console.error("Error fetching eMAR witnesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch witnesses" },
      { status: 500 }
    );
  }
}
