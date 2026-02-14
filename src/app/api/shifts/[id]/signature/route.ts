import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/mobile-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const signatureSchema = z.object({
  signature: z.string().min(1, "Signature is required"),
  signerName: z.string().optional(),
});

// Helper to get user from either mobile or web auth
async function getUser(request: Request) {
  // Try mobile auth first (for mobile app)
  const mobileUser = await getAuthUser(request);
  if (mobileUser) {
    return mobileUser;
  }

  // Fall back to web session auth
  const session = await auth();
  if (session?.user) {
    return session.user;
  }

  return null;
}

// POST /api/shifts/[id]/signature - Submit client signature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: shiftId } = await params;

    // Fetch the shift
    const shift = await prisma.shift.findUnique({
      where: {
        id: shiftId,
        companyId: user.companyId,
      },
      select: {
        id: true,
        status: true,
        carerId: true,
        clientSignature: true,
      },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Only the assigned carer can submit a signature
    if (shift.carerId !== user.id) {
      return NextResponse.json(
        { error: "Only the assigned carer can request client signature" },
        { status: 403 }
      );
    }

    // Signature can only be captured for in-progress shifts
    if (shift.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Client signature can only be captured during an active shift" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = signatureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { signature, signerName } = validation.data;

    // Update the shift with signature data
    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        clientSignature: signature,
        clientSignatureTimestamp: new Date(),
        clientSignatureName: signerName || null,
      },
      select: {
        id: true,
        clientSignature: true,
        clientSignatureTimestamp: true,
        clientSignatureName: true,
      },
    });

    return NextResponse.json({
      success: true,
      signature: {
        captured: true,
        timestamp: updatedShift.clientSignatureTimestamp?.toISOString(),
        signerName: updatedShift.clientSignatureName,
      },
    });
  } catch (error) {
    console.error("Error saving client signature:", error);
    return NextResponse.json(
      { error: "Failed to save client signature" },
      { status: 500 }
    );
  }
}

// GET /api/shifts/[id]/signature - Get client signature
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: shiftId } = await params;

    // Fetch the shift with signature data
    const shift = await prisma.shift.findUnique({
      where: {
        id: shiftId,
        companyId: user.companyId,
      },
      select: {
        id: true,
        carerId: true,
        clientId: true,
        clientSignature: true,
        clientSignatureTimestamp: true,
        clientSignatureName: true,
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

    if (!shift.clientSignature) {
      return NextResponse.json({
        hasSignature: false,
        signature: null,
      });
    }

    return NextResponse.json({
      hasSignature: true,
      signature: {
        data: shift.clientSignature,
        timestamp: shift.clientSignatureTimestamp?.toISOString(),
        signerName: shift.clientSignatureName,
      },
    });
  } catch (error) {
    console.error("Error fetching client signature:", error);
    return NextResponse.json(
      { error: "Failed to fetch client signature" },
      { status: 500 }
    );
  }
}
