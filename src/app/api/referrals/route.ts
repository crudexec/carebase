import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma, ReferralStatus } from "@prisma/client";
import { z } from "zod";

// Generate referral number
function generateReferralNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REF-${datePart}-${randomPart}`;
}

// GET /api/referrals - List referrals
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const assignedToId = searchParams.get("assignedToId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.ReferralWhereInput = {
      companyId: session.user.companyId,
    };

    if (status) {
      where.status = status as ReferralStatus;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { prospectFirstName: { contains: search, mode: "insensitive" } },
        { prospectLastName: { contains: search, mode: "insensitive" } },
        { referralNumber: { contains: search, mode: "insensitive" } },
        { prospectPhone: { contains: search } },
      ];
    }

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
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
        orderBy: { receivedDate: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.referral.count({ where }),
    ]);

    // Get status counts
    const statusCounts = await prisma.referral.groupBy({
      by: ["status"],
      where: { companyId: session.user.companyId },
      _count: true,
    });

    return NextResponse.json({
      referrals,
      total,
      statusCounts: statusCounts.reduce(
        (acc, curr) => ({ ...acc, [curr.status]: curr._count }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

const createReferralSchema = z.object({
  prospectFirstName: z.string().min(1, "First name is required"),
  prospectLastName: z.string().min(1, "Last name is required"),
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
});

// POST /api/referrals - Create new referral
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createReferralSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const referral = await prisma.referral.create({
      data: {
        referralNumber: generateReferralNumber(),
        companyId: session.user.companyId,
        prospectFirstName: data.prospectFirstName,
        prospectLastName: data.prospectLastName,
        prospectDob: data.prospectDob ? new Date(data.prospectDob) : undefined,
        prospectPhone: data.prospectPhone,
        prospectAddress: data.prospectAddress,
        prospectCity: data.prospectCity,
        prospectState: data.prospectState,
        prospectZip: data.prospectZip,
        primaryDiagnosis: data.primaryDiagnosis,
        diagnosisCodes: data.diagnosisCodes || [],
        medicaidId: data.medicaidId,
        insuranceInfo: data.insuranceInfo,
        requestedServices: data.requestedServices || [],
        hoursRequested: data.hoursRequested,
        specialNeeds: data.specialNeeds,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        emergencyRelation: data.emergencyRelation,
        referralSourceId: data.referralSourceId,
        referralSourceOther: data.referralSourceOther,
        urgency: data.urgency,
        reason: data.reason,
        assignedToId: data.assignedToId,
        status: "PENDING",
      },
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
        action: "REFERRAL_CREATED",
        entityType: "Referral",
        entityId: referral.id,
        changes: {
          referralNumber: referral.referralNumber,
          prospectName: `${data.prospectFirstName} ${data.prospectLastName}`,
        },
      },
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    );
  }
}
