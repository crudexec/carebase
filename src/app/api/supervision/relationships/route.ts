import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { SupervisorType, SupervisionFrequency } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  supervisorId: z.string().optional(),
  superviseeId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional().transform(v => v === "true"),
});

// Create relationship schema
const createSchema = z.object({
  supervisorId: z.string().min(1, "Supervisor is required"),
  superviseeId: z.string().min(1, "Supervisee is required"),
  relationshipType: z.nativeEnum(SupervisorType),
  discipline: z.string().optional(),
  requiredVisitFrequency: z.nativeEnum(SupervisionFrequency),
  requiredHoursPerPeriod: z.number().min(0).optional(),
});

// GET - List supervisory relationships
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

    const { supervisorId, superviseeId, isActive } = queryResult.data;

    // Non-managers can only view relationships they're part of
    const whereClause: any = { companyId };

    if (!canViewAll) {
      whereClause.OR = [
        { supervisorId: currentUserId },
        { superviseeId: currentUserId },
      ];
    } else {
      if (supervisorId) whereClause.supervisorId = supervisorId;
      if (superviseeId) whereClause.superviseeId = superviseeId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const relationships = await prisma.supervisoryRelationship.findMany({
      where: whereClause,
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        supervisee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            supervisionVisits: true,
          },
        },
      },
    });

    // Get last visit date for each relationship
    const relationshipsWithLastVisit = await Promise.all(
      relationships.map(async (r) => {
        const lastVisit = await prisma.supervisionVisit.findFirst({
          where: { relationshipId: r.id, status: "COMPLETED" },
          orderBy: { visitDate: "desc" },
          select: { visitDate: true },
        });

        return {
          ...r,
          lastVisitDate: lastVisit?.visitDate || null,
        };
      })
    );

    return NextResponse.json(relationshipsWithLastVisit);
  } catch (error) {
    console.error("Error fetching supervisory relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch supervisory relationships" },
      { status: 500 }
    );
  }
}

// POST - Create supervisory relationship
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

    // Verify supervisor exists
    const supervisor = await prisma.user.findFirst({
      where: { id: data.supervisorId, companyId },
    });

    if (!supervisor) {
      return NextResponse.json({ error: "Supervisor not found" }, { status: 404 });
    }

    // Verify supervisee exists
    const supervisee = await prisma.user.findFirst({
      where: { id: data.superviseeId, companyId },
    });

    if (!supervisee) {
      return NextResponse.json({ error: "Supervisee not found" }, { status: 404 });
    }

    // Prevent self-supervision
    if (data.supervisorId === data.superviseeId) {
      return NextResponse.json(
        { error: "A user cannot supervise themselves" },
        { status: 400 }
      );
    }

    // Check for existing active relationship with same discipline
    const existing = await prisma.supervisoryRelationship.findFirst({
      where: {
        supervisorId: data.supervisorId,
        superviseeId: data.superviseeId,
        discipline: data.discipline || null,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An active supervisory relationship already exists for this discipline" },
        { status: 400 }
      );
    }

    const relationship = await prisma.supervisoryRelationship.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true },
        },
        supervisee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    console.error("Error creating supervisory relationship:", error);
    return NextResponse.json(
      { error: "Failed to create supervisory relationship" },
      { status: 500 }
    );
  }
}
