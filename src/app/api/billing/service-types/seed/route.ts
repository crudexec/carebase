import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

// Standardized HCPCS codes for home care services
const HCPCS_CODES = [
  // Personal Care Services
  {
    code: "T1019",
    name: "Personal Care Services",
    description: "Personal care services, per 15 minutes, not for an inpatient or resident of a hospital, nursing facility, ICF/MR or IMD, part of the individualized plan of treatment",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "T1020",
    name: "Personal Care Services (Per Diem)",
    description: "Personal care services, per diem, not for an inpatient or resident of a hospital, nursing facility, ICF/MR or IMD, part of the individualized plan of treatment",
    unitType: "DAILY",
  },
  {
    code: "T1021",
    name: "Home Health Aide Visit",
    description: "Home health aide or certified nurse assistant, per visit",
    unitType: "HOURLY",
  },

  // Attendant Care Services
  {
    code: "S5125",
    name: "Attendant Care Services",
    description: "Attendant care services, per 15 minutes, not for an inpatient or resident of a hospital, nursing facility, ICF/MR or IMD, part of the individualized plan of treatment",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5126",
    name: "Attendant Care Services (Per Diem)",
    description: "Attendant care services, per diem, not for an inpatient or resident of a hospital, nursing facility, ICF/MR or IMD, part of the individualized plan of treatment",
    unitType: "DAILY",
  },

  // Homemaker Services
  {
    code: "S5130",
    name: "Homemaker Services",
    description: "Homemaker service, NOS, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5131",
    name: "Homemaker Services (Per Diem)",
    description: "Homemaker service, NOS, per diem",
    unitType: "DAILY",
  },

  // Companion Services
  {
    code: "S5135",
    name: "Companion Services",
    description: "Companion care, adult (e.g., IADL/ADL), per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5136",
    name: "Companion Services (Per Diem)",
    description: "Companion care, adult (e.g., IADL/ADL), per diem",
    unitType: "DAILY",
  },

  // Respite Care
  {
    code: "S5150",
    name: "Unskilled Respite Care",
    description: "Unskilled respite care, not hospice, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5151",
    name: "Unskilled Respite Care (Per Diem)",
    description: "Unskilled respite care, not hospice, per diem",
    unitType: "DAILY",
  },
  {
    code: "T1005",
    name: "Respite Care Services",
    description: "Respite care services, up to 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "H0045",
    name: "Respite Care (Mental Health)",
    description: "Respite care services, not in the home, per diem",
    unitType: "DAILY",
  },

  // Home Health Aide
  {
    code: "G0156",
    name: "Home Health Aide Services",
    description: "Services of home health aide in home health or hospice settings, per hour",
    unitType: "HOURLY",
  },
  {
    code: "S9122",
    name: "Home Health Aide (Per Visit)",
    description: "Home health aide or certified nurse assistant, per visit",
    unitType: "HOURLY",
  },

  // Nursing Services
  {
    code: "G0299",
    name: "Direct Skilled Nursing (RN)",
    description: "Direct skilled nursing services of a registered nurse (RN) in the home health or hospice setting, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "G0300",
    name: "Direct Skilled Nursing (LPN)",
    description: "Direct skilled nursing services of a licensed practical nurse (LPN) in the home health or hospice setting, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "T1030",
    name: "Nursing Care (Per Diem)",
    description: "Nursing care, in the home, by registered nurse, per diem",
    unitType: "DAILY",
  },
  {
    code: "T1031",
    name: "Nursing Care (Per 15 Min)",
    description: "Nursing care, in the home, by licensed practical nurse, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S9123",
    name: "Nursing Care (RN Visit)",
    description: "Nursing care, in the home; by registered nurse, per visit",
    unitType: "HOURLY",
  },
  {
    code: "S9124",
    name: "Nursing Care (RN Hourly)",
    description: "Nursing care, in the home; by registered nurse, per hour",
    unitType: "HOURLY",
  },

  // Community Support Services
  {
    code: "H2014",
    name: "Skills Training and Development",
    description: "Skills training and development, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "H2015",
    name: "Comprehensive Community Support",
    description: "Comprehensive community support services, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "H2016",
    name: "Comprehensive Community Support (Per Diem)",
    description: "Comprehensive community support services, per diem",
    unitType: "DAILY",
  },

  // Case Management
  {
    code: "T1016",
    name: "Case Management",
    description: "Case management, each 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "T1017",
    name: "Targeted Case Management",
    description: "Targeted case management, each 15 minutes",
    unitType: "QUARTER_HOURLY",
  },

  // Waiver Services
  {
    code: "T2025",
    name: "Waiver Services (NOS)",
    description: "Waiver services, NOS",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "T2026",
    name: "Specialized Services",
    description: "Specialized services by a licensed practical nurse (LPN) for waiver participants, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "T2027",
    name: "Specialized Services (RN)",
    description: "Specialized services by a registered nurse (RN) for waiver participants, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },

  // Day Services
  {
    code: "S5100",
    name: "Day Care Services (Adult)",
    description: "Day care services, adult; per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5101",
    name: "Day Care Services (Adult Per Diem)",
    description: "Day care services, adult; per half day",
    unitType: "DAILY",
  },
  {
    code: "S5102",
    name: "Day Care Services (Adult Full Day)",
    description: "Day care services, adult; per full day",
    unitType: "DAILY",
  },

  // Chore Services
  {
    code: "S5120",
    name: "Chore Services",
    description: "Chore services, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "S5121",
    name: "Chore Services (Per Diem)",
    description: "Chore services, per diem",
    unitType: "DAILY",
  },

  // Behavioral Health
  {
    code: "H0031",
    name: "Mental Health Assessment",
    description: "Mental health assessment, by non-physician",
    unitType: "HOURLY",
  },
  {
    code: "H0032",
    name: "Mental Health Service Plan",
    description: "Mental health service plan development by non-physician",
    unitType: "HOURLY",
  },
  {
    code: "H0036",
    name: "Community Psychiatric Support",
    description: "Community psychiatric supportive treatment, face-to-face, per 15 minutes",
    unitType: "QUARTER_HOURLY",
  },
  {
    code: "H0046",
    name: "Mental Health Services",
    description: "Mental health services, not otherwise specified",
    unitType: "HOURLY",
  },

  // Transportation
  {
    code: "T2001",
    name: "Non-Emergency Transportation",
    description: "Non-emergency transportation; patient attendant/escort",
    unitType: "HOURLY",
  },
  {
    code: "T2002",
    name: "Non-Emergency Transport (Per Diem)",
    description: "Non-emergency transportation; per diem",
    unitType: "DAILY",
  },
  {
    code: "T2003",
    name: "Non-Emergency Transport (Encounter)",
    description: "Non-emergency transportation; encounter/trip",
    unitType: "HOURLY",
  },

  // Therapy Services
  {
    code: "S9128",
    name: "Speech Therapy",
    description: "Speech therapy, in the home, per diem",
    unitType: "DAILY",
  },
  {
    code: "S9129",
    name: "Occupational Therapy",
    description: "Occupational therapy, in the home, per diem",
    unitType: "DAILY",
  },
  {
    code: "S9131",
    name: "Physical Therapy",
    description: "Physical therapy, in the home, per diem",
    unitType: "DAILY",
  },

  // Meals
  {
    code: "S5170",
    name: "Home Delivered Meals",
    description: "Home delivered meals, including preparation; per meal",
    unitType: "HOURLY",
  },

  // Environmental Modifications
  {
    code: "S5165",
    name: "Environmental Modifications",
    description: "Home modifications, per service",
    unitType: "HOURLY",
  },

  // Personal Emergency Response
  {
    code: "S5160",
    name: "Emergency Response System",
    description: "Emergency response system; installation and testing",
    unitType: "HOURLY",
  },
  {
    code: "S5161",
    name: "Emergency Response (Monthly)",
    description: "Emergency response system; service fee, per month",
    unitType: "DAILY",
  },
];

// POST - Seed HCPCS codes
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission - only admins can seed
    if (!hasAnyPermission(role, [PERMISSIONS.BILLING_FULL])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get existing codes for this company
    const existingCodes = await prisma.serviceType.findMany({
      where: { companyId },
      select: { code: true },
    });

    const existingCodeSet = new Set(existingCodes.map((c) => c.code));

    // Filter out codes that already exist
    const newCodes = HCPCS_CODES.filter((c) => !existingCodeSet.has(c.code));

    if (newCodes.length === 0) {
      return NextResponse.json({
        message: "All HCPCS codes already exist",
        created: 0,
        skipped: HCPCS_CODES.length,
      });
    }

    // Create new service types
    const created = await prisma.serviceType.createMany({
      data: newCodes.map((code) => ({
        code: code.code,
        name: code.name,
        description: code.description,
        unitType: code.unitType as "HOURLY" | "QUARTER_HOURLY" | "DAILY",
        isActive: true,
        companyId,
      })),
    });

    return NextResponse.json({
      message: `Successfully imported ${created.count} HCPCS codes`,
      created: created.count,
      skipped: HCPCS_CODES.length - newCodes.length,
      total: HCPCS_CODES.length,
    });
  } catch (error) {
    console.error("Error seeding HCPCS codes:", error);
    return NextResponse.json(
      { error: "Failed to seed HCPCS codes" },
      { status: 500 }
    );
  }
}

// GET - Get available HCPCS codes (for reference)
export async function GET() {
  return NextResponse.json({
    codes: HCPCS_CODES,
    total: HCPCS_CODES.length,
    categories: {
      personalCare: HCPCS_CODES.filter((c) =>
        ["T1019", "T1020", "T1021"].includes(c.code)
      ).length,
      attendantCare: HCPCS_CODES.filter((c) =>
        ["S5125", "S5126"].includes(c.code)
      ).length,
      homemaker: HCPCS_CODES.filter((c) =>
        ["S5130", "S5131"].includes(c.code)
      ).length,
      companion: HCPCS_CODES.filter((c) =>
        ["S5135", "S5136"].includes(c.code)
      ).length,
      respite: HCPCS_CODES.filter((c) =>
        ["S5150", "S5151", "T1005", "H0045"].includes(c.code)
      ).length,
      nursing: HCPCS_CODES.filter((c) =>
        c.code.startsWith("G0") || c.code.startsWith("T103") || c.code.startsWith("S912")
      ).length,
      other: HCPCS_CODES.length - 20,
    },
  });
}
