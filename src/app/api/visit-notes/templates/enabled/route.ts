import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/visit-notes/templates/enabled - Get enabled templates for carers
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Any authenticated user can see enabled templates
    const templates = await prisma.formTemplate.findMany({
      where: {
        companyId: session.user.companyId,
        isEnabled: true,
        status: "ACTIVE",
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching enabled templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch enabled templates" },
      { status: 500 }
    );
  }
}
