import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

// POST - Validate claim for submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get claim with all related data
    const claim = await prisma.claim.findFirst({
      where: { id, companyId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            medicaidId: true,
            medicaidPayerId: true,
            diagnosisCodes: true,
            authorizationNumber: true,
            authorizationStart: true,
            authorizationEnd: true,
            authorizationUnits: true,
          },
        },
        claimLines: {
          orderBy: { lineNumber: "asc" },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get company billing info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        npi: true,
        taxId: true,
        taxonomyCode: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingZip: true,
      },
    });

    const errors: ValidationError[] = [];

    // Provider validation
    if (!company?.npi || !/^\d{10}$/.test(company.npi)) {
      errors.push({
        field: "provider.npi",
        message: "Provider NPI must be exactly 10 digits",
        severity: "error",
      });
    }

    if (!company?.taxId || !/^\d{9}$/.test(company.taxId.replace(/-/g, ""))) {
      errors.push({
        field: "provider.taxId",
        message: "Provider Tax ID must be exactly 9 digits",
        severity: "error",
      });
    }

    if (!company?.taxonomyCode) {
      errors.push({
        field: "provider.taxonomyCode",
        message: "Provider taxonomy code is required",
        severity: "error",
      });
    }

    if (!company?.billingAddress) {
      errors.push({
        field: "provider.address",
        message: "Provider billing address is required",
        severity: "error",
      });
    }

    if (!company?.billingCity) {
      errors.push({
        field: "provider.city",
        message: "Provider billing city is required",
        severity: "error",
      });
    }

    if (!company?.billingState || !/^[A-Z]{2}$/i.test(company.billingState)) {
      errors.push({
        field: "provider.state",
        message: "Provider billing state must be a 2-letter code",
        severity: "error",
      });
    }

    if (!company?.billingZip) {
      errors.push({
        field: "provider.zip",
        message: "Provider billing zip code is required",
        severity: "error",
      });
    }

    // Patient validation
    if (!claim.patientMedicaidId) {
      errors.push({
        field: "patient.medicaidId",
        message: "Patient Medicaid ID is required",
        severity: "error",
      });
    }

    if (!claim.patientFirstName) {
      errors.push({
        field: "patient.firstName",
        message: "Patient first name is required",
        severity: "error",
      });
    }

    if (!claim.patientLastName) {
      errors.push({
        field: "patient.lastName",
        message: "Patient last name is required",
        severity: "error",
      });
    }

    if (!claim.patientDob) {
      errors.push({
        field: "patient.dob",
        message: "Patient date of birth is required",
        severity: "error",
      });
    }

    if (!claim.patientAddress) {
      errors.push({
        field: "patient.address",
        message: "Patient address is required",
        severity: "error",
      });
    }

    if (!claim.patientCity) {
      errors.push({
        field: "patient.city",
        message: "Patient city is required",
        severity: "error",
      });
    }

    if (!claim.patientState || !/^[A-Z]{2}$/i.test(claim.patientState)) {
      errors.push({
        field: "patient.state",
        message: "Patient state must be a 2-letter code",
        severity: "error",
      });
    }

    if (!claim.patientZip) {
      errors.push({
        field: "patient.zip",
        message: "Patient zip code is required",
        severity: "error",
      });
    }

    // Payer validation
    if (!claim.payerId) {
      errors.push({
        field: "payer.id",
        message: "Payer ID is required",
        severity: "error",
      });
    }

    // Diagnosis validation
    if (!claim.diagnosisCodes || claim.diagnosisCodes.length === 0) {
      errors.push({
        field: "diagnosisCodes",
        message: "At least one diagnosis code (ICD-10) is required",
        severity: "error",
      });
    } else {
      // Validate ICD-10 format (basic check)
      claim.diagnosisCodes.forEach((code, index) => {
        // ICD-10 format: letter followed by 2 digits, optional decimal and up to 4 more chars
        if (!/^[A-Z]\d{2}(\.\d{1,4})?$/i.test(code)) {
          errors.push({
            field: `diagnosisCodes[${index}]`,
            message: `Invalid ICD-10 code format: ${code}`,
            severity: "warning",
          });
        }
      });
    }

    // Service lines validation
    if (!claim.claimLines || claim.claimLines.length === 0) {
      errors.push({
        field: "serviceLines",
        message: "At least one service line is required",
        severity: "error",
      });
    } else {
      let calculatedTotal = 0;

      claim.claimLines.forEach((line, index) => {
        if (!line.hcpcsCode) {
          errors.push({
            field: `serviceLines[${index}].hcpcsCode`,
            message: `Line ${line.lineNumber}: HCPCS code is required`,
            severity: "error",
          });
        }

        if (line.units.toNumber() <= 0) {
          errors.push({
            field: `serviceLines[${index}].units`,
            message: `Line ${line.lineNumber}: Units must be greater than 0`,
            severity: "error",
          });
        }

        if (line.lineAmount.toNumber() <= 0) {
          errors.push({
            field: `serviceLines[${index}].lineAmount`,
            message: `Line ${line.lineNumber}: Line amount must be greater than 0`,
            severity: "error",
          });
        }

        if (!line.diagnosisPointer || (line.diagnosisPointer as string[]).length === 0) {
          errors.push({
            field: `serviceLines[${index}].diagnosisPointer`,
            message: `Line ${line.lineNumber}: At least one diagnosis pointer is required`,
            severity: "error",
          });
        }

        // Check service date is within claim date range
        const serviceDate = new Date(line.serviceDate).getTime();
        const startDate = new Date(claim.serviceStartDate).getTime();
        const endDate = new Date(claim.serviceEndDate).getTime();

        if (serviceDate < startDate || serviceDate > endDate) {
          errors.push({
            field: `serviceLines[${index}].serviceDate`,
            message: `Line ${line.lineNumber}: Service date is outside claim date range`,
            severity: "warning",
          });
        }

        calculatedTotal += line.lineAmount.toNumber();
      });

      // Verify totals
      const claimTotal = claim.totalAmount.toNumber();
      if (Math.abs(calculatedTotal - claimTotal) > 0.01) {
        errors.push({
          field: "totalAmount",
          message: `Claim total ($${claimTotal.toFixed(2)}) does not match sum of line amounts ($${calculatedTotal.toFixed(2)})`,
          severity: "error",
        });
      }
    }

    // Authorization check (warning only)
    if (claim.client.authorizationNumber) {
      const now = new Date();

      if (claim.client.authorizationStart && new Date(claim.client.authorizationStart) > claim.serviceStartDate) {
        errors.push({
          field: "authorization",
          message: "Service dates begin before authorization start date",
          severity: "warning",
        });
      }

      if (claim.client.authorizationEnd && new Date(claim.client.authorizationEnd) < claim.serviceEndDate) {
        errors.push({
          field: "authorization",
          message: "Service dates extend beyond authorization end date",
          severity: "warning",
        });
      }

      if (claim.client.authorizationEnd && new Date(claim.client.authorizationEnd) < now) {
        errors.push({
          field: "authorization",
          message: "Client authorization has expired",
          severity: "warning",
        });
      }
    } else {
      errors.push({
        field: "authorization",
        message: "No prior authorization number on file for client",
        severity: "warning",
      });
    }

    // Determine if claim is valid for submission
    const hasErrors = errors.some((e) => e.severity === "error");
    const hasWarnings = errors.some((e) => e.severity === "warning");

    return NextResponse.json({
      valid: !hasErrors,
      canSubmit: !hasErrors,
      errorCount: errors.filter((e) => e.severity === "error").length,
      warningCount: errors.filter((e) => e.severity === "warning").length,
      errors: errors.filter((e) => e.severity === "error"),
      warnings: errors.filter((e) => e.severity === "warning"),
      claim: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        totalAmount: claim.totalAmount.toNumber(),
        lineCount: claim.claimLines.length,
      },
    });
  } catch (error) {
    console.error("Error validating claim:", error);
    return NextResponse.json(
      { error: "Failed to validate claim" },
      { status: 500 }
    );
  }
}
