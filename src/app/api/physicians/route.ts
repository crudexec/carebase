import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/physicians - List physicians
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive") !== "false"; // Default to true

    const physicians = await prisma.physician.findMany({
      where: {
        companyId: session.user.companyId,
        isActive,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { npi: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json({ physicians });
  } catch (error) {
    console.error("Error fetching physicians:", error);
    return NextResponse.json(
      { error: "Failed to fetch physicians" },
      { status: 500 }
    );
  }
}

const createPhysicianSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  npi: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// POST /api/physicians - Create physician
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createPhysicianSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const physician = await prisma.physician.create({
      data: {
        companyId: session.user.companyId,
        ...validation.data,
        email: validation.data.email || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "PHYSICIAN_CREATED",
        entityType: "Physician",
        entityId: physician.id,
        changes: {
          name: `${physician.firstName} ${physician.lastName}`,
        },
      },
    });

    return NextResponse.json({ physician }, { status: 201 });
  } catch (error) {
    console.error("Error creating physician:", error);
    return NextResponse.json(
      { error: "Failed to create physician" },
      { status: 500 }
    );
  }
}
