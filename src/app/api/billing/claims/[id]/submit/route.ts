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
const submitRequestSchema = z.object({
  clearinghouse: z.enum(["GENERIC", "AVAILITY", "OFFICE_ALLY"]).default("GENERIC"),
  submissionType: z.enum(["ORIGINAL", "CORRECTED", "VOID"]).default("ORIGINAL"),
});

// POST - Submit claim to clearinghouse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;
    const { id } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_SUBMIT,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const validationResult = submitRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { clearinghouse, submissionType } = validationResult.data;

    // Get claim with all related data
    const claim = await prisma.claim.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        claimLines: {
          orderBy: { lineNumber: "asc" },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Check claim status
    if (!["DRAFT", "READY", "REJECTED", "DENIED"].includes(claim.status)) {
      return NextResponse.json(
        {
          error: `Cannot submit claim in ${claim.status} status`,
          currentStatus: claim.status,
        },
        { status: 400 }
      );
    }

    // Get company billing info
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

    // Build service lines
    const serviceLines: EDI837PServiceLine[] = claim.claimLines.map((line) => ({
      lineNumber: line.lineNumber,
      serviceDate: line.serviceDate,
      hcpcsCode: line.hcpcsCode,
      modifiers: line.modifiers as string[],
      units: line.units.toNumber(),
      unitRate: line.unitRate.toNumber(),
      lineAmount: line.lineAmount.toNumber(),
      diagnosisPointers: line.diagnosisPointer as string[],
      placeOfService: claim.placeOfService,
    }));

    // Build EDI claim
    const ediClaim: EDI837PClaim = {
      claimNumber: claim.claimNumber,
      serviceStartDate: claim.serviceStartDate,
      serviceEndDate: claim.serviceEndDate,
      patient: {
        medicaidId: claim.patientMedicaidId,
        firstName: claim.patientFirstName,
        lastName: claim.patientLastName,
        dob: claim.patientDob,
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
    };

    // Build batch
    const ediBatch: EDI837PBatch = {
      submitter: {
        name: company.billingName || company.name,
        identifier: company.npi,
        contactName: "Billing Department",
        contactPhone: company.billingPhone || company.phone || "",
        contactEmail: undefined,
      },
      receiver: {
        name: claim.payerName || "Medicaid",
        identifier: claim.payerId,
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
      claims: [ediClaim],
    };

    // Validate the batch
    const validationErrors = validateBatch(ediBatch);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Claim validation failed",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Generate EDI content
    const ediContent = generateEDI837P(ediBatch);
    const filename = generateEDIFilename(company.name, claim.claimNumber);

    // Handle submission based on clearinghouse type
    let submissionResult: {
      status: "PENDING" | "TRANSMITTED" | "ERROR";
      acknowledgementId?: string;
      errors?: string[];
    };

    switch (clearinghouse) {
      case "AVAILITY":
        // TODO: Implement Availity API integration
        submissionResult = {
          status: "PENDING",
          errors: ["Availity integration not yet implemented - use GENERIC export"],
        };
        break;

      case "OFFICE_ALLY":
        // TODO: Implement Office Ally API integration
        submissionResult = {
          status: "PENDING",
          errors: ["Office Ally integration not yet implemented - use GENERIC export"],
        };
        break;

      case "GENERIC":
      default:
        // Generic export - just generate the file
        submissionResult = {
          status: "TRANSMITTED",
        };
        break;
    }

    // Create submission record
    const submission = await prisma.claimSubmission.create({
      data: {
        submissionType,
        status: submissionResult.status,
        clearinghouse,
        ediFileName: filename,
        ediContent,
        submittedById: userId,
        acknowledgementId: submissionResult.acknowledgementId,
        errors: submissionResult.errors ? { errors: submissionResult.errors } : undefined,
        companyId,
        claimId: claim.id,
      },
    });

    // Update claim status
    const newStatus = submissionResult.status === "ERROR" ? claim.status : "SUBMITTED";
    await prisma.claim.update({
      where: { id },
      data: {
        status: newStatus,
        submittedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "SUBMIT_CLAIM",
        entityType: "Claim",
        entityId: id,
        changes: {
          clearinghouse,
          submissionType,
          submissionId: submission.id,
          filename,
          status: submissionResult.status,
        },
        userId,
        companyId,
      },
    });

    return NextResponse.json({
      message: "Claim submitted successfully",
      submission: {
        id: submission.id,
        status: submission.status,
        clearinghouse: submission.clearinghouse,
        filename,
        submittedAt: submission.submittedAt,
      },
      claim: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        status: newStatus,
      },
      // Include EDI content for GENERIC export
      ...(clearinghouse === "GENERIC" && {
        ediContent,
        downloadUrl: `/api/billing/submissions/${submission.id}/download`,
      }),
    });
  } catch (error) {
    console.error("Error submitting claim:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}
