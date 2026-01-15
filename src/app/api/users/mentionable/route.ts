import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/users/mentionable - Get users that can be mentioned in comments
// This is a lightweight endpoint accessible by any authenticated user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Get all active users in the same company (excluding sponsors)
    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true,
        role: {
          not: "SPONSOR", // Sponsors typically shouldn't be mentioned in internal comments
        },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 50, // Limit results
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      })),
    });
  } catch (error) {
    console.error("Error fetching mentionable users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
