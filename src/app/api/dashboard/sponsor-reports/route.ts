import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { FormSchemaSnapshot } from "@/lib/visit-notes/types";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    if (role !== "SPONSOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const sponsorClients = await prisma.client.findMany({
      where: { companyId, sponsorId: userId },
      select: { id: true },
    });
    const clientIds = sponsorClients.map((client) => client.id);

    if (clientIds.length === 0) {
      return NextResponse.json({ reports: [] });
    }

    const take = query.data.limit;
    const visitNotes = await prisma.visitNote.findMany({
      where: {
        companyId,
        clientId: { in: clientIds },
        qaStatus: "APPROVED",
      },
      select: {
        id: true,
        formSchemaSnapshot: true,
        visitDate: true,
        submittedAt: true,
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
      },
      orderBy: { submittedAt: "desc" },
      take,
    });

    const reports = visitNotes.map((note) => {
      const snapshot = note.formSchemaSnapshot as unknown as FormSchemaSnapshot;
      return {
        id: note.id,
        source: "visit-note" as const,
        title: snapshot.templateName || "Visit Note",
        statusLabel: "Approved",
        date: (note.visitDate || note.submittedAt).toISOString(),
        submittedAt: note.submittedAt.toISOString(),
        href: `/visit-notes/${note.id}`,
        summary: null,
        shift: note.shift
          ? {
              id: note.shift.id,
              scheduledStart: note.shift.scheduledStart.toISOString(),
              scheduledEnd: note.shift.scheduledEnd.toISOString(),
            }
          : null,
        client: note.client,
        carer: note.carer,
      };
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching sponsor reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsor reports" },
      { status: 500 }
    );
  }
}
