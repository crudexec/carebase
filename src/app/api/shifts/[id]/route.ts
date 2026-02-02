import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

// GET /api/shifts/[id] - Get single shift
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[Shift API] Request headers:", request.headers.get("Authorization")?.substring(0, 50));
    const user = await getAuthUser(request);
    console.log("[Shift API] User:", user ? user.id : "null");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shift = await prisma.shift.findUnique({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            phone: true,
            diagnosisCodes: true,
            primaryDiagnosis: true,
            medicalNotes: true,
          },
        },
        visitNotes: {
          select: {
            id: true,
            qaStatus: true,
            submittedAt: true,
            data: true,
          },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Verify access - carers can only see their own shifts
    if (user.role === "CARER" && shift.carerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Sponsors can only see shifts for their clients
    if (user.role === "SPONSOR") {
      const client = await prisma.client.findFirst({
        where: {
          id: shift.clientId,
          sponsorId: user.id,
        },
      });
      if (!client) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error fetching shift:", error);
    return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 });
  }
}
