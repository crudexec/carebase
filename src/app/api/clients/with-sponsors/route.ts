import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/clients/with-sponsors
 * Get all clients with their sponsor information for bulk report sending
 *
 * Query params:
 * - status: Filter by client status (optional)
 * - search: Search by client name (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const clients = await prisma.client.findMany({
      where: {
        companyId,
        ...(status ? { status: status as "PROSPECT" | "ONBOARDING" | "ACTIVE" | "INACTIVE" } : {}),
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
        status: true,
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    // Transform to include sponsor availability status
    const clientsWithSponsorInfo = clients.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      fullName: `${client.firstName} ${client.lastName}`,
      status: client.status,
      hasSponsor: !!client.sponsor,
      sponsorHasEmail: !!client.sponsor?.email,
      sponsor: client.sponsor
        ? {
            id: client.sponsor.id,
            fullName: `${client.sponsor.firstName} ${client.sponsor.lastName}`,
            email: client.sponsor.email,
          }
        : null,
      canSendReport: !!client.sponsor?.email,
    }));

    // Calculate summary
    const summary = {
      total: clients.length,
      withSponsor: clients.filter((c) => c.sponsor).length,
      withSponsorEmail: clients.filter((c) => c.sponsor?.email).length,
      canReceiveReports: clients.filter((c) => c.sponsor?.email).length,
    };

    return NextResponse.json({
      clients: clientsWithSponsorInfo,
      summary,
    });
  } catch (error) {
    console.error("Error fetching clients with sponsors:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
