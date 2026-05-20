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

    const canView =
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_VIEW) ||
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_MANAGE);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const templates = await prisma.formTemplate.findMany({
      where: {
        companyId: session.user.companyId,
        type: "CLIENT_FORM",
        status: "ACTIVE",
        isEnabled: true,
      },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching enabled client form templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch enabled client form templates" },
      { status: 500 }
    );
  }
}
