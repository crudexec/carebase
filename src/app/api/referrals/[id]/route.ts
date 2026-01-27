import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReferralStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/referrals/[id] - Get single referral
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const referral = await prisma.referral.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        referralSource: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
        intake: {
          select: {
            id: true,
            intakeNumber: true,
            status: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    return NextResponse.json({ referral });
  } catch (error) {
    console.error("Error fetching referral:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral" },
      { status: 500 }
    );
  }
}

const updateReferralSchema = z.object({
  status: z.nativeEnum(ReferralStatus).optional(),
  prospectFirstName: z.string().optional(),
  prospectLastName: z.string().optional(),
  prospectDob: z.string().optional(),
  prospectPhone: z.string().optional(),
  prospectAddress: z.string().optional(),
  prospectCity: z.string().optional(),
  prospectState: z.string().optional(),
  prospectZip: z.string().optional(),
  primaryDiagnosis: z.string().optional(),
  diagnosisCodes: z.array(z.string()).optional(),
  medicaidId: z.string().optional(),
  insuranceInfo: z.string().optional(),
  requestedServices: z.array(z.string()).optional(),
  hoursRequested: z.number().optional(),
  specialNeeds: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  referralSourceId: z.string().optional(),
  referralSourceOther: z.string().optional(),
  urgency: z.enum(["ROUTINE", "URGENT", "STAT"]).optional(),
  reason: z.string().optional(),
  assignedToId: z.string().optional(),
  lastContactDate: z.string().optional(),
  lastContactMethod: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  declineReason: z.string().optional(),
  lostReason: z.string().optional(),
});

// PATCH /api/referrals/[id] - Update referral
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check referral exists and belongs to company
    const existingReferral = await prisma.referral.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existingReferral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateReferralSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Handle date fields
    if (data.prospectDob !== undefined) {
      updateData.prospectDob = data.prospectDob ? new Date(data.prospectDob) : null;
    }
    if (data.lastContactDate !== undefined) {
      updateData.lastContactDate = data.lastContactDate
        ? new Date(data.lastContactDate)
        : null;
    }
    if (data.nextFollowUpDate !== undefined) {
      updateData.nextFollowUpDate = data.nextFollowUpDate
        ? new Date(data.nextFollowUpDate)
        : null;
    }

    // Handle status changes
    if (data.status) {
      updateData.status = data.status;

      // Set timestamps based on status
      if (data.status === "DECLINED" && !existingReferral.declinedAt) {
        updateData.declinedAt = new Date();
      }
      if (data.status === "LOST" && !existingReferral.lostReason) {
        updateData.lostReason = data.lostReason;
      }
    }

    // Copy other fields
    const directFields = [
      "prospectFirstName",
      "prospectLastName",
      "prospectPhone",
      "prospectAddress",
      "prospectCity",
      "prospectState",
      "prospectZip",
      "primaryDiagnosis",
      "diagnosisCodes",
      "medicaidId",
      "insuranceInfo",
      "requestedServices",
      "hoursRequested",
      "specialNeeds",
      "emergencyContact",
      "emergencyPhone",
      "emergencyRelation",
      "referralSourceId",
      "referralSourceOther",
      "urgency",
      "reason",
      "assignedToId",
      "lastContactMethod",
      "followUpNotes",
      "declineReason",
      "lostReason",
    ];

    for (const field of directFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
      }
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        referralSource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "REFERRAL_UPDATED",
        entityType: "Referral",
        entityId: referral.id,
        changes: JSON.parse(JSON.stringify(updateData)),
      },
    });

    return NextResponse.json({ referral });
  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      { error: "Failed to update referral" },
      { status: 500 }
    );
  }
}

// DELETE /api/referrals/[id] - Delete referral (admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check referral exists and belongs to company
    const existingReferral = await prisma.referral.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existingReferral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    // Don't allow deletion if converted
    if (existingReferral.clientId) {
      return NextResponse.json(
        { error: "Cannot delete converted referral" },
        { status: 400 }
      );
    }

    await prisma.referral.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "REFERRAL_DELETED",
        entityType: "Referral",
        entityId: id,
        changes: {
          referralNumber: existingReferral.referralNumber,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting referral:", error);
    return NextResponse.json(
      { error: "Failed to delete referral" },
      { status: 500 }
    );
  }
}
