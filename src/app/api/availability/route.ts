import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  isRecurring: z.boolean().default(true),
  specificDate: z.string().optional(),
});

const updateAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema),
});

// GET /api/availability - Get current user's availability
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only caregivers can manage their own availability
    if (session.user.role !== "CARER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get or create caregiver profile
    let profile = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
      include: { availabilitySlots: true },
    });

    if (!profile) {
      profile = await prisma.caregiverProfile.create({
        data: {
          userId: session.user.id,
          certifications: [],
          availableDays: [],
        },
        include: { availabilitySlots: true },
      });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        availableDays: profile.availableDays,
        availabilitySlots: profile.availabilitySlots,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// PUT /api/availability - Update availability slots
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CARER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateAvailabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get or create caregiver profile
    let profile = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.caregiverProfile.create({
        data: {
          userId: session.user.id,
          certifications: [],
          availableDays: [],
        },
      });
    }

    // Delete existing slots and create new ones
    await prisma.$transaction([
      prisma.caregiverAvailability.deleteMany({
        where: { caregiverProfileId: profile.id },
      }),
      ...validation.data.slots.map((slot) =>
        prisma.caregiverAvailability.create({
          data: {
            caregiverProfileId: profile!.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: slot.isRecurring,
            specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
          },
        })
      ),
    ]);

    // Fetch updated profile
    const updatedProfile = await prisma.caregiverProfile.findUnique({
      where: { id: profile.id },
      include: { availabilitySlots: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "AVAILABILITY_UPDATED",
        entityType: "CaregiverProfile",
        entityId: profile.id,
        changes: {
          slotsCount: validation.data.slots.length,
        },
      },
    });

    return NextResponse.json({
      profile: {
        id: updatedProfile?.id,
        availableDays: updatedProfile?.availableDays,
        availabilitySlots: updatedProfile?.availabilitySlots,
      },
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}
