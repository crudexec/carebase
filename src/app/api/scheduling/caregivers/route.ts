import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageSchedule } from "@/lib/scheduling";

// GET /api/scheduling/caregivers - List caregivers for scheduling
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users who can manage schedules can get the caregiver list
    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const caregivers = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: "CARER",
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json({ caregivers });
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    return NextResponse.json({ error: "Failed to fetch caregivers" }, { status: 500 });
  }
}
