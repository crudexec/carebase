import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CredentialStatus } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  caregiverId: z.string().optional(),
  credentialTypeId: z.string().optional(),
  status: z.nativeEnum(CredentialStatus).optional(),
  expiringWithinDays: z.coerce.number().int().min(1).optional(),
});

// Create credential schema
const createSchema = z.object({
  caregiverProfileId: z.string().min(1, "Caregiver is required"),
  credentialTypeId: z.string().min(1, "Credential type is required"),
  licenseNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  issuingState: z.string().optional(),
  issueDate: z.string().transform((s) => new Date(s)),
  expirationDate: z.string().transform((s) => new Date(s)),
  documentUrls: z.array(z.string()).default([]),
  verificationUrl: z.string().optional(),
  notes: z.string().optional(),
});

// Helper to calculate credential status
function calculateStatus(expirationDate: Date, reminderDays: number[]): CredentialStatus {
  const now = new Date();
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return CredentialStatus.EXPIRED;
  }

  // If within the first reminder threshold, mark as expiring soon
  const minReminderDays = Math.min(...reminderDays);
  if (daysUntilExpiration <= minReminderDays) {
    return CredentialStatus.EXPIRING_SOON;
  }

  return CredentialStatus.ACTIVE;
}

// GET - List credentials
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;

    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isCarer = role === "CARER";

    if (!canViewAll && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { caregiverId, credentialTypeId, status, expiringWithinDays } = queryResult.data;

    // Build expiration date filter
    let expirationFilter = {};
    if (expiringWithinDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringWithinDays);
      expirationFilter = {
        expirationDate: {
          lte: futureDate,
          gte: new Date(), // Not already expired
        },
      };
    }

    // If carer, only show their own credentials
    let caregiverFilter = {};
    if (isCarer && !canViewAll) {
      const caregiverProfile = await prisma.caregiverProfile.findFirst({
        where: {
          user: { id: userId, companyId },
        },
      });
      if (!caregiverProfile) {
        return NextResponse.json({ credentials: [] });
      }
      caregiverFilter = { caregiverProfileId: caregiverProfile.id };
    } else if (caregiverId) {
      caregiverFilter = { caregiverProfileId: caregiverId };
    }

    const credentials = await prisma.caregiverCredential.findMany({
      where: {
        caregiverProfile: {
          user: { companyId },
        },
        ...caregiverFilter,
        ...(credentialTypeId && { credentialTypeId }),
        ...(status && { status }),
        ...expirationFilter,
      },
      include: {
        credentialType: {
          select: {
            id: true,
            name: true,
            category: true,
            isRequired: true,
          },
        },
        caregiverProfile: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { expirationDate: "asc" },
      ],
    });

    // Calculate summary statistics
    const now = new Date();
    const summary = {
      total: credentials.length,
      active: credentials.filter(c => c.status === CredentialStatus.ACTIVE).length,
      expiringSoon: credentials.filter(c => c.status === CredentialStatus.EXPIRING_SOON).length,
      expired: credentials.filter(c => c.status === CredentialStatus.EXPIRED).length,
    };

    return NextResponse.json({ credentials, summary });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

// POST - Create credential
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isCarer = role === "CARER";

    if (!canManage && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify caregiver profile exists and belongs to company
    let caregiverProfile = await prisma.caregiverProfile.findFirst({
      where: {
        id: result.data.caregiverProfileId,
        user: { companyId },
      },
      include: {
        user: { select: { id: true } },
      },
    });

    // If profile not found by ID, check if it's a userId and create profile if needed
    if (!caregiverProfile) {
      // Check if the provided ID is actually a user ID
      const user = await prisma.user.findFirst({
        where: {
          id: result.data.caregiverProfileId,
          companyId,
        },
        include: {
          caregiverProfile: true,
        },
      });

      if (user) {
        // User exists - create or get their caregiver profile
        if (user.caregiverProfile) {
          caregiverProfile = {
            ...user.caregiverProfile,
            user: { id: user.id },
          };
          // Update the caregiverProfileId in result data
          result.data.caregiverProfileId = user.caregiverProfile.id;
        } else {
          // Create a new caregiver profile for this user
          const newProfile = await prisma.caregiverProfile.create({
            data: {
              userId: user.id,
            },
            include: {
              user: { select: { id: true } },
            },
          });
          caregiverProfile = newProfile;
          result.data.caregiverProfileId = newProfile.id;
        }
      } else {
        return NextResponse.json(
          { error: "Staff member not found" },
          { status: 404 }
        );
      }
    }

    // If carer, can only add credentials for themselves
    if (isCarer && !canManage && caregiverProfile.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify credential type exists and belongs to company
    const credentialType = await prisma.credentialType.findFirst({
      where: {
        id: result.data.credentialTypeId,
        companyId,
        isActive: true,
      },
    });

    if (!credentialType) {
      return NextResponse.json(
        { error: "Credential type not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate initial status
    const status = calculateStatus(result.data.expirationDate, credentialType.reminderDays);

    const credential = await prisma.caregiverCredential.create({
      data: {
        ...result.data,
        status,
      },
      include: {
        credentialType: {
          select: {
            id: true,
            name: true,
            category: true,
            isRequired: true,
          },
        },
        caregiverProfile: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error("Error creating credential:", error);
    return NextResponse.json(
      { error: "Failed to create credential" },
      { status: 500 }
    );
  }
}
