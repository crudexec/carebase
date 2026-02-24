import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/narcotic-counts/[id] - Get a single narcotic count record
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const count = await prisma.narcoticCountRecord.findFirst({
      where: {
        id,
        inventory: {
          companyId: session.user.companyId,
        },
      },
      include: {
        inventory: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                genericName: true,
                strength: true,
                form: true,
                controlledSchedule: true,
                client: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        countedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        resolvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!count) {
      return NextResponse.json(
        { error: "Narcotic count not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching narcotic count:", error);
    return NextResponse.json(
      { error: "Failed to fetch narcotic count" },
      { status: 500 }
    );
  }
}
