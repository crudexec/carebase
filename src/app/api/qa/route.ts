import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/qa - Get items pending QA review
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only certain roles can access QA
    const allowedRoles = ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "assessments", "visit-notes", or null for all
    const status = searchParams.get("status"); // "PENDING_REVIEW", "APPROVED", "REJECTED", or null for pending
    const clientId = searchParams.get("clientId");

    const qaStatus = status || "PENDING_REVIEW";

    // Build filters
    // For PENDING_REVIEW, also include items with null qaStatus (legacy items)
    const assessmentWhere: Record<string, unknown> = {
      companyId: session.user.companyId,
      ...(qaStatus === "PENDING_REVIEW"
        ? { OR: [{ qaStatus: "PENDING_REVIEW" }, { qaStatus: null }] }
        : { qaStatus: qaStatus }),
    };

    const visitNoteWhere: Record<string, unknown> = {
      companyId: session.user.companyId,
      ...(qaStatus === "PENDING_REVIEW"
        ? { OR: [{ qaStatus: "PENDING_REVIEW" }, { qaStatus: null }] }
        : { qaStatus: qaStatus }),
    };

    if (clientId) {
      assessmentWhere.clientId = clientId;
      visitNoteWhere.clientId = clientId;
    }

    const results: {
      assessments: unknown[];
      visitNotes: unknown[];
      stats: {
        pendingAssessments: number;
        pendingVisitNotes: number;
        approvedToday: number;
        rejectedToday: number;
      };
    } = {
      assessments: [],
      visitNotes: [],
      stats: {
        pendingAssessments: 0,
        pendingVisitNotes: 0,
        approvedToday: 0,
        rejectedToday: 0,
      },
    };

    // Fetch assessments if type is null or "assessments"
    if (!type || type === "assessments") {
      results.assessments = await prisma.assessment.findMany({
        where: assessmentWhere,
        include: {
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assessor: {
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
        orderBy: { submittedForQAAt: "desc" },
      });
    }

    // Fetch visit notes if type is null or "visit-notes"
    if (!type || type === "visit-notes") {
      results.visitNotes = await prisma.visitNote.findMany({
        where: visitNoteWhere,
        include: {
          template: {
            select: {
              id: true,
              name: true,
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
          shift: {
            select: {
              id: true,
              scheduledStart: true,
              scheduledEnd: true,
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
        orderBy: { submittedAt: "desc" },
      });
    }

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingAssessments, pendingVisitNotes, approvedToday, rejectedToday] =
      await Promise.all([
        prisma.assessment.count({
          where: {
            companyId: session.user.companyId,
            OR: [{ qaStatus: "PENDING_REVIEW" }, { qaStatus: null }],
          },
        }),
        prisma.visitNote.count({
          where: {
            companyId: session.user.companyId,
            OR: [{ qaStatus: "PENDING_REVIEW" }, { qaStatus: null }],
          },
        }),
        prisma.$transaction([
          prisma.assessment.count({
            where: {
              companyId: session.user.companyId,
              qaStatus: "APPROVED",
              qaReviewedAt: { gte: today },
            },
          }),
          prisma.visitNote.count({
            where: {
              companyId: session.user.companyId,
              qaStatus: "APPROVED",
              qaReviewedAt: { gte: today },
            },
          }),
        ]).then(([a, v]) => a + v),
        prisma.$transaction([
          prisma.assessment.count({
            where: {
              companyId: session.user.companyId,
              qaStatus: "REJECTED",
              qaReviewedAt: { gte: today },
            },
          }),
          prisma.visitNote.count({
            where: {
              companyId: session.user.companyId,
              qaStatus: "REJECTED",
              qaReviewedAt: { gte: today },
            },
          }),
        ]).then(([a, v]) => a + v),
      ]);

    results.stats = {
      pendingAssessments,
      pendingVisitNotes,
      approvedToday,
      rejectedToday,
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching QA items:", error);
    return NextResponse.json(
      { error: "Failed to fetch QA items" },
      { status: 500 }
    );
  }
}
