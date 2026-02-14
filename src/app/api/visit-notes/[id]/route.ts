import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { FormSchemaSnapshot, VisitNoteData } from "@/lib/visit-notes/types";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/visit-notes/[id] - Get visit note details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        shift: {
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        qaReviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        files: {
          select: {
            id: true,
            fieldId: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            fileUrl: true,
          },
        },
        thresholdBreaches: {
          select: {
            id: true,
            fieldId: true,
            fieldLabel: true,
            value: true,
            minThreshold: true,
            maxThreshold: true,
            breachType: true,
            customMessage: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
        { status: 404 }
      );
    }

    // Check permissions - carers can only see their own notes
    if (
      user.role === "CARER" &&
      visitNote.carerId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Transform response
    const schemaSnapshot = visitNote.formSchemaSnapshot as unknown as FormSchemaSnapshot;
    const response = {
      id: visitNote.id,
      formSchemaSnapshot: schemaSnapshot,
      data: visitNote.data as unknown as VisitNoteData,
      submittedAt: visitNote.submittedAt.toISOString(),
      updatedAt: visitNote.updatedAt.toISOString(),
      templateId: visitNote.templateId,
      templateName: schemaSnapshot?.templateName || (schemaSnapshot as FormSchemaSnapshot & { name?: string })?.name || null,
      templateVersion: visitNote.templateVersion,
      shiftId: visitNote.shiftId,
      qaStatus: visitNote.qaStatus,
      qaComment: visitNote.qaComment,
      qaReviewedAt: visitNote.qaReviewedAt?.toISOString() || null,
      qaReviewedBy: visitNote.qaReviewedBy,
      shift: {
        id: visitNote.shift.id,
        scheduledStart: visitNote.shift.scheduledStart.toISOString(),
        scheduledEnd: visitNote.shift.scheduledEnd.toISOString(),
      },
      client: visitNote.client,
      carer: visitNote.carer,
      submittedBy: visitNote.submittedBy,
      submittedOnBehalf: visitNote.carerId !== visitNote.submittedById,
      files: visitNote.files,
      thresholdBreaches: visitNote.thresholdBreaches.map((breach) => ({
        id: breach.id,
        fieldId: breach.fieldId,
        fieldLabel: breach.fieldLabel,
        value: breach.value,
        minThreshold: breach.minThreshold,
        maxThreshold: breach.maxThreshold,
        breachType: breach.breachType,
        customMessage: breach.customMessage,
        createdAt: breach.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ visitNote: response });
  } catch (error) {
    console.error("Error fetching visit note:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit note" },
      { status: 500 }
    );
  }
}

// Schema for updating visit note
const updateVisitNoteSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
  resubmit: z.boolean().optional(),
});

// PATCH /api/visit-notes/[id] - Update and optionally resubmit a visit note
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the visit note
    const visitNote = await prisma.visitNote.findFirst({
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
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!visitNote) {
      return NextResponse.json(
        { error: "Visit note not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = visitNote.carerId === user.id;
    const canManageAll = hasPermission(user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL);

    // Carers can only edit their own notes that haven't been approved
    if (user.role === "CARER") {
      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (visitNote.qaStatus === "APPROVED") {
        return NextResponse.json(
          { error: "Cannot edit approved visit notes" },
          { status: 400 }
        );
      }
    } else if (!canManageAll) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const validation = updateVisitNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data, resubmit } = validation.data;

    // Build update data
    const updateData: Prisma.VisitNoteUpdateInput = {
      updatedAt: new Date(),
    };

    if (data) {
      // Merge new data with existing data
      const existingData = visitNote.data as Record<string, unknown>;
      updateData.data = { ...existingData, ...data } as unknown as Prisma.InputJsonValue;
    }

    if (resubmit) {
      // Reset QA status for re-review
      updateData.qaStatus = "PENDING_REVIEW";
      updateData.qaComment = null;
      updateData.qaReviewedAt = null;
      updateData.qaReviewedBy = { disconnect: true };
    }

    // Update the visit note
    const updatedVisitNote = await prisma.visitNote.update({
      where: { id },
      data: updateData,
      include: {
        shift: {
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        qaReviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: resubmit ? "VISIT_NOTE_RESUBMITTED" : "VISIT_NOTE_UPDATED",
        entityType: "VisitNote",
        entityId: id,
        changes: {
          updatedFields: data ? Object.keys(data) : [],
          resubmitted: resubmit || false,
          previousQaStatus: visitNote.qaStatus,
          newQaStatus: resubmit ? "PENDING_REVIEW" : visitNote.qaStatus,
        },
      },
    });

    return NextResponse.json({
      visitNote: updatedVisitNote,
      message: resubmit ? "Visit note resubmitted for review" : "Visit note updated",
    });
  } catch (error) {
    console.error("Error updating visit note:", error);
    return NextResponse.json(
      { error: "Failed to update visit note" },
      { status: 500 }
    );
  }
}
