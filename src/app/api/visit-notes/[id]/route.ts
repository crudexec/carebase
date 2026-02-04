import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { FormSchemaSnapshot, VisitNoteData } from "@/lib/visit-notes/types";

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
    const response = {
      id: visitNote.id,
      formSchemaSnapshot: visitNote.formSchemaSnapshot as unknown as FormSchemaSnapshot,
      data: visitNote.data as unknown as VisitNoteData,
      submittedAt: visitNote.submittedAt.toISOString(),
      updatedAt: visitNote.updatedAt.toISOString(),
      templateId: visitNote.templateId,
      templateVersion: visitNote.templateVersion,
      qaStatus: visitNote.qaStatus,
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
