import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { SupervisionVisitStatus } from "@prisma/client";

// Sign visit schema
const signSchema = z.object({
  signature: z.string().min(1, "Signature is required"),
  role: z.enum(["supervisor", "supervisee"]),
});

// POST - Sign supervision visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: currentUserId } = session.user;
    const { id } = await params;

    const body = await request.json();
    const parseResult = signSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { signature, role: signerRole } = parseResult.data;

    const visit = await prisma.supervisionVisit.findFirst({
      where: { id, companyId },
      include: {
        relationship: true,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    // Verify the current user is the appropriate signer
    if (signerRole === "supervisor" && visit.relationship.supervisorId !== currentUserId) {
      return NextResponse.json({ error: "Only the supervisor can sign as supervisor" }, { status: 403 });
    }

    if (signerRole === "supervisee" && visit.relationship.superviseeId !== currentUserId) {
      return NextResponse.json({ error: "Only the supervisee can sign as supervisee" }, { status: 403 });
    }

    // Update with signature
    const updateData: any = {};
    if (signerRole === "supervisor") {
      updateData.supervisorSignature = signature;
      updateData.supervisorSignedAt = new Date();
    } else {
      updateData.superviseeSignature = signature;
      updateData.superviseeSignedAt = new Date();
      updateData.superviseeAcknowledged = true;
    }

    // If both signatures are present and visit is completed, keep it completed
    const updatedVisit = await prisma.supervisionVisit.update({
      where: { id },
      data: updateData,
      include: {
        relationship: {
          include: {
            supervisor: {
              select: { id: true, firstName: true, lastName: true },
            },
            supervisee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      visit: updatedVisit,
      signedAs: signerRole,
      bothSigned: updatedVisit.supervisorSignature && updatedVisit.superviseeSignature,
    });
  } catch (error) {
    console.error("Error signing supervision visit:", error);
    return NextResponse.json(
      { error: "Failed to sign supervision visit" },
      { status: 500 }
    );
  }
}
