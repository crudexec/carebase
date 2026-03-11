import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { SupervisionVisitType, SupervisionVisitStatus, PerformanceRating } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  relationshipId: z.string().optional(),
  supervisorId: z.string().optional(),
  superviseeId: z.string().optional(),
  status: z.nativeEnum(SupervisionVisitStatus).optional(),
  upcoming: z.enum(["true", "false"]).optional().transform(v => v === "true"),
});

// Create visit schema
const createSchema = z.object({
  relationshipId: z.string().min(1, "Relationship is required"),
  scheduledDate: z.string().transform((s) => new Date(s)),
  scheduledDuration: z.number().int().min(15, "Minimum 15 minutes"),
  visitType: z.nativeEnum(SupervisionVisitType),
  clientId: z.string().optional(),
  location: z.string().optional(),
});

// Document visit schema
const _documentSchema = z.object({
  visitDate: z.string().transform((s) => new Date(s)),
  actualDuration: z.number().int().min(1),
  clinicalObservations: z.string().optional(),
  technicalSkills: z.string().optional(),
  communicationSkills: z.string().optional(),
  documentationReview: z.string().optional(),
  overallRating: z.nativeEnum(PerformanceRating).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  feedbackProvided: z.string().optional(),
  goalsReviewed: z.array(z.string()).default([]),
  newGoalsSet: z.array(z.string()).default([]),
  followUpRequired: z.boolean().default(false),
  followUpItems: z.array(z.string()).default([]),
  nextVisitDate: z.string().transform((s) => new Date(s)).optional(),
});

// GET - List supervision visits
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;

    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { relationshipId, supervisorId, superviseeId, status, upcoming } = queryResult.data;

    // Build where clause
    const whereClause: any = { companyId };

    if (!canViewAll) {
      // Non-managers can only see visits where they're supervisor or supervisee
      whereClause.relationship = {
        OR: [
          { supervisorId: currentUserId },
          { superviseeId: currentUserId },
        ],
      };
    } else {
      if (relationshipId) whereClause.relationshipId = relationshipId;
      if (supervisorId) whereClause.relationship = { supervisorId };
      if (superviseeId) whereClause.relationship = { ...whereClause.relationship, superviseeId };
    }

    if (status) whereClause.status = status;
    if (upcoming) whereClause.scheduledDate = { gte: new Date() };

    const visits = await prisma.supervisionVisit.findMany({
      where: whereClause,
      orderBy: { scheduledDate: "asc" },
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
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error fetching supervision visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch supervision visits" },
      { status: 500 }
    );
  }
}

// POST - Create/schedule supervision visit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = createSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify relationship exists
    const relationship = await prisma.supervisoryRelationship.findFirst({
      where: { id: data.relationshipId, companyId, isActive: true },
    });

    if (!relationship) {
      return NextResponse.json({ error: "Supervisory relationship not found" }, { status: 404 });
    }

    // Verify client if provided
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, companyId },
      });
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
    }

    const visit = await prisma.supervisionVisit.create({
      data: {
        ...data,
        status: SupervisionVisitStatus.SCHEDULED,
        companyId,
      },
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
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("Error creating supervision visit:", error);
    return NextResponse.json(
      { error: "Failed to create supervision visit" },
      { status: 500 }
    );
  }
}
