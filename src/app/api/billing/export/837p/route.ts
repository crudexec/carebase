import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import {
  generateEDI837P,
  validateBatch,
  generateEDIFilename,
  type EDI837PBatch,
  type EDI837PClaim,
  type EDI837PServiceLine,
} from "@/lib/billing/edi-837p";

// Request validation schema
const exportRequestSchema = z.object({
  claimIds: z.array(z.string()).min(1),
  receiverName: z.string().optional(),
  receiverId: z.string().optional(),
  validateOnly: z.boolean().optional().default(false),
});

// POST - Generate EDI 837P file from claims
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_SUBMIT,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = exportRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { claimIds, receiverName, receiverId, validateOnly } =
      validationResult.data;

    // Get company with billing info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        npi: true,
        taxId: true,
        taxonomyCode: true,
        billingName: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingZip: true,
        billingPhone: true,
        phone: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Validate company has required billing info
    if (!company.npi || !company.taxId || !company.taxonomyCode) {
      return NextResponse.json(
        {
          error: "Company billing information incomplete",
          missing: [
            !company.npi && "NPI",
            !company.taxId && "Tax ID",
            !company.taxonomyCode && "Taxonomy Code",
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    // Get claims with all related data
    const claims = await prisma.claim.findMany({
      where: {
        id: { in: claimIds },
        companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            medicaidId: true,
            medicaidPayerId: true,
          },
        },
        claimLines: {
          orderBy: { lineNumber: "asc" },
          include: {
            serviceType: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (claims.length === 0) {
      return NextResponse.json({ error: "No claims found" }, { status: 404 });
    }

    // Verify all claims are in READY status (or allow DRAFT for testing)
    const invalidClaims = claims.filter(
      (c) => !["READY", "DRAFT"].includes(c.status)
    );
    if (invalidClaims.length > 0) {
      return NextResponse.json(
        {
          error: "Some claims cannot be exported",
          invalidClaims: invalidClaims.map((c) => ({
            id: c.id,
            claimNumber: c.claimNumber,
            status: c.status,
          })),
        },
        { status: 400 }
      );
    }

    // Get the payer info (use first claim's payer or override from request)
    const payerId = receiverId || claims[0].payerId;
    const payerName = receiverName || claims[0].payerName || "Medicaid";

    // Build EDI batch
    const ediBatch: EDI837PBatch = {
      submitter: {
        name: company.billingName || company.name,
        identifier: company.npi,
        contactName: "Billing Department",
        contactPhone: company.billingPhone || company.phone || "",
        contactEmail: undefined,
      },
      receiver: {
        name: payerName,
        identifier: payerId,
      },
      provider: {
        npi: company.npi,
        taxId: company.taxId,
        taxonomyCode: company.taxonomyCode,
        name: company.billingName || company.name,
        address: company.billingAddress || "",
        city: company.billingCity || "",
        state: company.billingState || "",
        zip: company.billingZip || "",
        phone: company.billingPhone || company.phone || undefined,
      },
      claims: claims.map((claim): EDI837PClaim => {
        const serviceLines: EDI837PServiceLine[] = claim.claimLines.map(
          (line) => ({
            lineNumber: line.lineNumber,
            serviceDate: line.serviceDate,
            hcpcsCode: line.hcpcsCode,
            modifiers: line.modifiers as string[],
            units: line.units.toNumber(),
            unitRate: line.unitRate.toNumber(),
            lineAmount: line.lineAmount.toNumber(),
            diagnosisPointers: line.diagnosisPointer as string[],
            placeOfService: claim.placeOfService,
          })
        );

        return {
          claimNumber: claim.claimNumber,
          serviceStartDate: claim.serviceStartDate,
          serviceEndDate: claim.serviceEndDate,
          patient: {
            medicaidId: claim.patientMedicaidId,
            firstName: claim.patientFirstName,
            lastName: claim.patientLastName,
            dob: claim.patientDob,
            gender: undefined, // Not stored in current schema
            address: claim.patientAddress,
            city: claim.patientCity,
            state: claim.patientState,
            zip: claim.patientZip,
            phone: claim.patientPhone || undefined,
          },
          diagnosisCodes: claim.diagnosisCodes,
          totalAmount: claim.totalAmount.toNumber(),
          placeOfService: claim.placeOfService,
          serviceLines,
          priorAuthNumber: undefined, // Could add to schema
        };
      }),
    };

    // Validate the batch
    const validationErrors = validateBatch(ediBatch);

    if (validateOnly) {
      return NextResponse.json({
        valid: validationErrors.length === 0,
        errors: validationErrors,
        claimCount: claims.length,
      });
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Generate EDI content
    const ediContent = generateEDI837P(ediBatch);
    const filename = generateEDIFilename(company.name);

    // Create submission records for each claim
    const submissionPromises = claims.map((claim) =>
      prisma.claimSubmission.create({
        data: {
          submissionType: "ORIGINAL",
          status: "PENDING",
          clearinghouse: "GENERIC",
          ediFileName: filename,
          ediContent: ediContent,
          submittedById: userId,
          companyId,
          claimId: claim.id,
        },
      })
    );

    // Update claim statuses if they were READY
    const updatePromises = claims
      .filter((c) => c.status === "READY")
      .map((claim) =>
        prisma.claim.update({
          where: { id: claim.id },
          data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
          },
        })
      );

    await Promise.all([...submissionPromises, ...updatePromises]);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "EXPORT_837P",
        entityType: "Claim",
        entityId: claims.map((c) => c.id).join(","),
        changes: {
          claimCount: claims.length,
          filename,
          claimNumbers: claims.map((c) => c.claimNumber),
        },
        userId,
        companyId,
      },
    });

    // Return the EDI file as downloadable content
    return new NextResponse(ediContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Filename": filename,
        "X-Claims-Count": String(claims.length),
      },
    });
  } catch (error) {
    console.error("Error generating 837P:", error);
    return NextResponse.json(
      { error: "Failed to generate 837P file" },
      { status: 500 }
    );
  }
}
