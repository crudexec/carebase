import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CompetencyStatus } from "@prisma/client";

// Create staff competency assessment schema
const assessSchema = z.object({
  competencyId: z.string().min(1, "Competency is required"),
  status: z.nativeEnum(CompetencyStatus),
  score: z.number().min(0).max(100).optional(),
  observations: z.string().optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  documentUrls: z.array(z.string()).default([]),
  validUntil: z.string().transform((s) => new Date(s)),
});

// GET - Get staff competencies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;
    const { id: staffId } = await params;

    // Allow users to view their own competencies
    const isOwnProfile = currentUserId === staffId;
    const canViewOthers = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!isOwnProfile && !canViewOthers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify staff exists in same company
    const staff = await prisma.user.findFirst({
      where: { id: staffId, companyId },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get all competencies and mark which ones the staff has
    const [allCompetencies, staffCompetencies] = await Promise.all([
      prisma.competency.findMany({
        where: { companyId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.staffCompetency.findMany({
        where: { userId: staffId, companyId },
        include: {
          competency: true,
          assessedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          remediationPlan: {
            select: { id: true, status: true },
          },
        },
        orderBy: { assessedAt: "desc" },
      }),
    ]);

    // Get the most recent assessment for each competency
    const competencyMap = new Map<string, typeof staffCompetencies[0]>();
    staffCompetencies.forEach((sc) => {
      if (!competencyMap.has(sc.competencyId)) {
        competencyMap.set(sc.competencyId, sc);
      }
    });

    // Build response with all competencies and their status
    const result = allCompetencies.map((competency) => {
      const assessment = competencyMap.get(competency.id);
      const now = new Date();
      const isExpired = assessment ? assessment.validUntil < now : false;

      return {
        competency,
        latestAssessment: assessment || null,
        status: assessment
          ? isExpired
            ? CompetencyStatus.EXPIRED
            : assessment.status
          : null,
        isExpired,
        isRequired: competency.requiredForRoles.includes(staff.role),
      };
    });

    // Calculate summary stats
    const summary = {
      total: allCompetencies.length,
      assessed: competencyMap.size,
      competent: Array.from(competencyMap.values()).filter(
        (sc) => sc.status === CompetencyStatus.COMPETENT && sc.validUntil >= new Date()
      ).length,
      expired: Array.from(competencyMap.values()).filter(
        (sc) => sc.validUntil < new Date()
      ).length,
      needsImprovement: Array.from(competencyMap.values()).filter(
        (sc) => sc.status === CompetencyStatus.NEEDS_IMPROVEMENT
      ).length,
      notCompetent: Array.from(competencyMap.values()).filter(
        (sc) => sc.status === CompetencyStatus.NOT_COMPETENT
      ).length,
      required: allCompetencies.filter((c) =>
        c.requiredForRoles.includes(staff.role)
      ).length,
      requiredMet: Array.from(competencyMap.values()).filter(
        (sc) =>
          sc.competency.requiredForRoles.includes(staff.role) &&
          sc.status === CompetencyStatus.COMPETENT &&
          sc.validUntil >= new Date()
      ).length,
    };

    return NextResponse.json({
      staff,
      competencies: result,
      summary,
      history: staffCompetencies,
    });
  } catch (error) {
    console.error("Error fetching staff competencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff competencies" },
      { status: 500 }
    );
  }
}

// POST - Create/assess staff competency
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: assessorId } = session.user;
    const { id: staffId } = await params;

    const canAssess = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canAssess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = assessSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify staff exists
    const staff = await prisma.user.findFirst({
      where: { id: staffId, companyId },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Verify competency exists
    const competency = await prisma.competency.findFirst({
      where: { id: data.competencyId, companyId },
    });

    if (!competency) {
      return NextResponse.json({ error: "Competency not found" }, { status: 404 });
    }

    // Check if passing score is required
    if (competency.passingScore && data.score !== undefined) {
      if (data.score < competency.passingScore && data.status === CompetencyStatus.COMPETENT) {
        return NextResponse.json(
          { error: `Score must be at least ${competency.passingScore} to be marked as competent` },
          { status: 400 }
        );
      }
    }

    const staffCompetency = await prisma.staffCompetency.create({
      data: {
        userId: staffId,
        competencyId: data.competencyId,
        assessedAt: new Date(),
        assessedById: assessorId,
        status: data.status,
        score: data.score,
        observations: data.observations,
        strengths: data.strengths,
        areasForImprovement: data.areasForImprovement,
        documentUrls: data.documentUrls,
        validUntil: data.validUntil,
        isExpired: data.validUntil < new Date(),
        requiresRemediation: (
          [CompetencyStatus.NOT_COMPETENT, CompetencyStatus.NEEDS_IMPROVEMENT] as CompetencyStatus[]
        ).includes(data.status),
        companyId,
      },
      include: {
        competency: true,
        assessedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(staffCompetency, { status: 201 });
  } catch (error) {
    console.error("Error assessing staff competency:", error);
    return NextResponse.json(
      { error: "Failed to assess staff competency" },
      { status: 500 }
    );
  }
}
