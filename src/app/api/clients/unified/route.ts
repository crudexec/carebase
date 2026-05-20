import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClientStatus } from "@prisma/client";
import { z } from "zod";

// Generate referral number
function generateReferralNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REF-${datePart}-${randomPart}`;
}

// Generate intake number
function generateIntakeNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INT-${datePart}-${randomPart}`;
}

const unifiedFormSchema = z.object({
  mode: z.enum(["referral", "client"]),
  referralId: z.string().optional(),
  data: z.object({
    // Basic Info (Step 1)
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    status: z.nativeEnum(ClientStatus).optional(),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    // Care Needs (Step 2)
    primaryDiagnosis: z.string().optional(),
    requestedServices: z.array(z.string()).optional(),
    hoursRequested: z.number().optional(),
    urgency: z.enum(["ROUTINE", "URGENT", "STAT"]).optional(),
    specialNeeds: z.string().optional(),
    // Referral Source (Step 3)
    referralSourceId: z.string().optional(),
    referralSourceOther: z.string().optional(),
    referralDate: z.string().optional(),
    reason: z.string().optional(),
    assignedToId: z.string().optional(),
    // Full Profile (Step 4)
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    emergencyRelation: z.string().optional(),
    medicaidId: z.string().optional(),
    medicaidPayerId: z.string().optional(),
    secondaryInsuranceId: z.string().optional(),
    secondaryPayerId: z.string().optional(),
    insuranceInfo: z.string().optional(),
    physicianName: z.string().optional(),
    physicianNpi: z.string().optional(),
    physicianPhone: z.string().optional(),
    physicianFax: z.string().optional(),
    physicianAddress: z.string().optional(),
    medicalNotes: z.string().optional(),
    assignedCarerId: z.string().optional(),
  }),
});

// POST /api/clients/unified - Create referral or client based on mode
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
    const validation = unifiedFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { mode, referralId, data } = validation.data;

    if (mode === "referral") {
      // Create a referral record
      const referral = await prisma.referral.create({
        data: {
          referralNumber: generateReferralNumber(),
          companyId: session.user.companyId,
          prospectFirstName: data.firstName,
          prospectLastName: data.lastName,
          prospectDob: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          prospectPhone: data.phone,
          prospectAddress: data.address,
          prospectCity: data.city,
          prospectState: data.state,
          prospectZip: data.zipCode,
          primaryDiagnosis: data.primaryDiagnosis,
          diagnosisCodes: [],
          medicaidId: data.medicaidId,
          insuranceInfo: data.insuranceInfo,
          requestedServices: data.requestedServices || [],
          hoursRequested: data.hoursRequested,
          specialNeeds: data.specialNeeds,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          emergencyRelation: data.emergencyRelation,
          referralSourceId: data.referralSourceId === "OTHER" ? undefined : data.referralSourceId,
          referralSourceOther: data.referralSourceId === "OTHER" ? data.referralSourceOther : undefined,
          urgency: data.urgency,
          reason: data.reason,
          assignedToId: data.assignedToId || undefined,
          status: "PENDING",
          receivedDate: data.referralDate ? new Date(data.referralDate) : new Date(),
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
            prospectName: `${data.firstName} ${data.lastName}`,
            source: "unified_form",
          },
        },
      });

      return NextResponse.json(
        {
          type: "referral",
          id: referral.id,
          referral,
        },
        { status: 201 }
      );
    }

    // Mode is "client" - create client (and convert referral if provided)
    if (referralId) {
      // Converting an existing referral
      const referral = await prisma.referral.findFirst({
        where: {
          id: referralId,
          companyId: session.user.companyId,
        },
        include: {
          referralSource: true,
        },
      });

      if (!referral) {
        return NextResponse.json(
          { error: "Referral not found" },
          { status: 404 }
        );
      }

      if (referral.clientId) {
        return NextResponse.json(
          { error: "Referral already converted" },
          { status: 400 }
        );
      }

      // Create client, intake, and update referral in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create client with full profile data
        const client = await tx.client.create({
          data: {
            companyId: session.user.companyId,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            medicaidId: data.medicaidId,
            medicaidPayerId: data.medicaidPayerId,
            secondaryInsuranceId: data.secondaryInsuranceId,
            secondaryPayerId: data.secondaryPayerId,
            primaryDiagnosis: data.primaryDiagnosis,
            diagnosisCodes: [],
            physicianName: data.physicianName,
            physicianNpi: data.physicianNpi,
            physicianPhone: data.physicianPhone,
            physicianFax: data.physicianFax,
            physicianAddress: data.physicianAddress,
            medicalNotes: data.medicalNotes,
            assignedCarerId: data.assignedCarerId || undefined,
            referralSource: referral.referralSource?.name || data.referralSourceOther,
            referralDate: referral.receivedDate,
            referralNotes: data.reason,
            status: data.status || "ONBOARDING",
          },
        });

        // Create intake
        const intake = await tx.intake.create({
          data: {
            intakeNumber: generateIntakeNumber(),
            companyId: session.user.companyId,
            clientId: client.id,
            referralId: referral.id,
            intakeCoordinatorId: session.user.id,
            status: "REFERRAL",
            completedSteps: [],
          },
        });

        // Update referral
        await tx.referral.update({
          where: { id: referralId },
          data: {
            status: "CONVERTED",
            clientId: client.id,
            convertedAt: new Date(),
            // Update referral with any new data from the form
            emergencyContact: data.emergencyContact,
            emergencyPhone: data.emergencyPhone,
            emergencyRelation: data.emergencyRelation,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            companyId: session.user.companyId,
            userId: session.user.id,
            action: "REFERRAL_CONVERTED",
            entityType: "Referral",
            entityId: referral.id,
            changes: {
              referralNumber: referral.referralNumber,
              clientId: client.id,
              intakeId: intake.id,
              source: "unified_form",
            },
          },
        });

        return { client, intake };
      });

      return NextResponse.json(
        {
          type: "client",
          id: result.client.id,
          client: result.client,
          intake: result.intake,
        },
        { status: 201 }
      );
    }

    // Creating a new client directly (no referral)
    const client = await prisma.client.create({
      data: {
        companyId: session.user.companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        medicaidId: data.medicaidId,
        medicaidPayerId: data.medicaidPayerId,
        secondaryInsuranceId: data.secondaryInsuranceId,
        secondaryPayerId: data.secondaryPayerId,
        primaryDiagnosis: data.primaryDiagnosis,
        diagnosisCodes: [],
        physicianName: data.physicianName,
        physicianNpi: data.physicianNpi,
        physicianPhone: data.physicianPhone,
        physicianFax: data.physicianFax,
        physicianAddress: data.physicianAddress,
        medicalNotes: data.medicalNotes,
        assignedCarerId: data.assignedCarerId || undefined,
        referralSource: data.referralSourceOther || undefined,
        referralDate: data.referralDate ? new Date(data.referralDate) : undefined,
        referralNotes: data.reason,
        status: data.status || "PROSPECT",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CLIENT_CREATED",
        entityType: "Client",
        entityId: client.id,
        changes: {
          clientName: `${data.firstName} ${data.lastName}`,
          source: "unified_form",
        },
      },
    });

    return NextResponse.json(
      {
        type: "client",
        id: client.id,
        client,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in unified client/referral creation:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
