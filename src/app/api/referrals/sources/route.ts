import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReferralSource } from "@prisma/client";
import { z } from "zod";

// GET /api/referrals/sources - List referral sources
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sources = await prisma.referralSourceRecord.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true,
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Get referral counts per source
    const referralCounts = await prisma.referral.groupBy({
      by: ["referralSourceId"],
      where: {
        companyId: session.user.companyId,
        referralSourceId: { not: null },
      },
      _count: true,
    });

    const countsMap = referralCounts.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.referralSourceId!]: curr._count,
      }),
      {} as Record<string, number>
    );

    const sourcesWithCounts = sources.map((source) => ({
      ...source,
      referralCount: countsMap[source.id] || 0,
    }));

    return NextResponse.json({ sources: sourcesWithCounts });
  } catch (error) {
    console.error("Error fetching referral sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral sources" },
      { status: 500 }
    );
  }
}

const createSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ReferralSource),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  fax: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/referrals/sources - Create referral source
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OPS_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createSourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const source = await prisma.referralSourceRecord.create({
      data: {
        companyId: session.user.companyId,
        name: data.name,
        type: data.type,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email || undefined,
        fax: data.fax,
        address: data.address,
        notes: data.notes,
        isActive: true,
      },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error("Error creating referral source:", error);
    return NextResponse.json(
      { error: "Failed to create referral source" },
      { status: 500 }
    );
  }
}
