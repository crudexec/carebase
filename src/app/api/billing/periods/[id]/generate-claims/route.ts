import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { format } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

// Generate unique claim number
function generateClaimNumber(): string {
  const date = format(new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CB-${date}-${random}`;
}

// POST - Generate claims from shifts for a billing period
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
    const { id: periodId } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify period exists and is OPEN
    const period = await prisma.billingPeriod.findFirst({
      where: { id: periodId, companyId },
    });

    if (!period) {
      return NextResponse.json(
        { error: "Billing period not found" },
        { status: 404 }
      );
    }

    if (period.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only generate claims for open billing periods" },
        { status: 400 }
      );
    }

    // Get company billing info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        npi: true,
        taxId: true,
        taxonomyCode: true,
        billingName: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingZip: true,
      },
    });

    if (!company?.npi || !company?.taxId) {
      return NextResponse.json(
        {
          error: "Company billing information incomplete",
          missing: [
            !company?.npi && "NPI",
            !company?.taxId && "Tax ID",
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    // Get completed shifts with attendance records in the period
    const shifts = await prisma.shift.findMany({
      where: {
        companyId,
        status: "COMPLETED",
        // Shifts that overlap with the billing period
        OR: [
          {
            scheduledStart: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
          {
            scheduledEnd: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        ],
      },
      include: {
        client: {
          include: {
            billingRate: {
              include: {
                serviceType: true,
              },
            },
          },
        },
        attendanceRecords: {
          where: {
            date: {
              gte: period.startDate,
              lte: period.endDate,
            },
            checkInTime: { not: null },
            checkOutTime: { not: null },
          },
        },
      },
    });

    // Group shifts by client
    const clientShifts = shifts.reduce(
      (acc, shift) => {
        if (!acc[shift.clientId]) {
          acc[shift.clientId] = [];
        }
        acc[shift.clientId].push(shift);
        return acc;
      },
      {} as Record<string, typeof shifts>
    );

    const results = {
      claimsCreated: 0,
      claimsSkipped: 0,
      errors: [] as string[],
    };

    // Create claim for each client
    for (const [clientId, clientShiftList] of Object.entries(clientShifts)) {
      const client = clientShiftList[0].client;

      // Validate client has required billing info
      if (!client.medicaidId || !client.medicaidPayerId) {
        results.claimsSkipped++;
        results.errors.push(
          `Client ${client.firstName} ${client.lastName}: Missing Medicaid ID or Payer ID`
        );
        continue;
      }

      if (!client.diagnosisCodes || client.diagnosisCodes.length === 0) {
        results.claimsSkipped++;
        results.errors.push(
          `Client ${client.firstName} ${client.lastName}: No diagnosis codes`
        );
        continue;
      }

      // Get billing rate for client
      const billingRate = client.billingRate;
      if (!billingRate) {
        results.claimsSkipped++;
        results.errors.push(
          `Client ${client.firstName} ${client.lastName}: No billing rate assigned`
        );
        continue;
      }

      // Check if claim already exists for this client in this period
      const existingClaim = await prisma.claim.findFirst({
        where: {
          clientId,
          billingPeriodId: periodId,
        },
      });

      if (existingClaim) {
        results.claimsSkipped++;
        continue;
      }

      // Calculate claim lines from attendance records
      const claimLines: {
        lineNumber: number;
        serviceDate: Date;
        hcpcsCode: string;
        units: number;
        unitRate: number;
        lineAmount: number;
        shiftId: string;
        shiftAttendanceId: string;
        serviceTypeId: string;
        billingRateId: string;
      }[] = [];

      let lineNumber = 0;
      for (const shift of clientShiftList) {
        for (const attendance of shift.attendanceRecords) {
          if (!attendance.checkInTime || !attendance.checkOutTime) continue;

          lineNumber++;
          const hoursWorked =
            (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) /
            (1000 * 60 * 60);

          // Round to 2 decimal places
          const units = Math.round(hoursWorked * 100) / 100;
          const rate = billingRate.rate.toNumber();
          const lineAmount = Math.round(units * rate * 100) / 100;

          claimLines.push({
            lineNumber,
            serviceDate: attendance.date,
            hcpcsCode: billingRate.serviceType.code,
            units,
            unitRate: rate,
            lineAmount,
            shiftId: shift.id,
            shiftAttendanceId: attendance.id,
            serviceTypeId: billingRate.serviceTypeId,
            billingRateId: billingRate.id,
          });
        }
      }

      if (claimLines.length === 0) {
        results.claimsSkipped++;
        results.errors.push(
          `Client ${client.firstName} ${client.lastName}: No billable service lines`
        );
        continue;
      }

      // Calculate totals
      const totalUnits = claimLines.reduce((sum, line) => sum + line.units, 0);
      const totalAmount = claimLines.reduce((sum, line) => sum + line.lineAmount, 0);

      // Find service date range
      const serviceDates = claimLines.map((l) => l.serviceDate);
      const serviceStartDate = new Date(
        Math.min(...serviceDates.map((d) => d.getTime()))
      );
      const serviceEndDate = new Date(
        Math.max(...serviceDates.map((d) => d.getTime()))
      );

      // Create claim with lines
      await prisma.claim.create({
        data: {
          claimNumber: generateClaimNumber(),
          status: "DRAFT",
          serviceStartDate,
          serviceEndDate,
          // Patient snapshot
          patientMedicaidId: client.medicaidId,
          patientFirstName: client.firstName,
          patientLastName: client.lastName,
          patientDob: client.dateOfBirth || new Date("1900-01-01"),
          patientAddress: client.address || "",
          patientCity: client.city || "",
          patientState: client.state || "",
          patientZip: client.zipCode || "",
          patientPhone: client.phone,
          // Provider snapshot
          providerNpi: company.npi,
          providerTaxId: company.taxId,
          providerTaxonomy: company.taxonomyCode || "",
          providerName: company.billingName || company.name,
          providerAddress: company.billingAddress || "",
          providerCity: company.billingCity || "",
          providerState: company.billingState || "",
          providerZip: company.billingZip || "",
          // Payer
          payerId: client.medicaidPayerId,
          // Diagnosis
          diagnosisCodes: client.diagnosisCodes,
          // Totals
          totalUnits: new Decimal(totalUnits),
          totalAmount: new Decimal(totalAmount),
          // Relations
          companyId,
          clientId,
          billingPeriodId: periodId,
          // Create claim lines
          claimLines: {
            create: claimLines.map((line) => ({
              lineNumber: line.lineNumber,
              serviceDate: line.serviceDate,
              hcpcsCode: line.hcpcsCode,
              modifiers: [],
              units: new Decimal(line.units),
              unitRate: new Decimal(line.unitRate),
              lineAmount: new Decimal(line.lineAmount),
              diagnosisPointer: ["1"],
              shiftId: line.shiftId,
              shiftAttendanceId: line.shiftAttendanceId,
              serviceTypeId: line.serviceTypeId,
              billingRateId: line.billingRateId,
            })),
          },
        },
      });

      results.claimsCreated++;
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GENERATE_CLAIMS",
        entityType: "BillingPeriod",
        entityId: periodId,
        changes: results,
        userId,
        companyId,
      },
    });

    return NextResponse.json({
      message: `Generated ${results.claimsCreated} claims`,
      ...results,
    });
  } catch (error) {
    console.error("Error generating claims:", error);
    return NextResponse.json(
      { error: "Failed to generate claims" },
      { status: 500 }
    );
  }
}
