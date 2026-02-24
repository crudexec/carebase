import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MedicationRoute } from "@prisma/client";

/**
 * RxNorm Medication Search API
 *
 * Proxies requests to NIH's RxNorm API for medication lookup.
 * API Documentation: https://rxnav.nlm.nih.gov/RxNormAPIs.html
 */

const RXNORM_API_BASE = "https://rxnav.nlm.nih.gov/REST";

interface RxNormConceptProperty {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
}

interface RxNormConceptGroup {
  tty: string;
  conceptProperties?: RxNormConceptProperty[];
}

interface RxNormDrugGroup {
  name: string;
  conceptGroup?: RxNormConceptGroup[];
}

interface RxNormDrugsResponse {
  drugGroup: RxNormDrugGroup;
}

interface MedicationSearchResult {
  rxcui: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  route: MedicationRoute;
}

// Map drug form strings to MedicationRoute enum
function mapFormToRoute(name: string): MedicationRoute {
  const lowered = name.toLowerCase();

  if (
    lowered.includes("tablet") ||
    lowered.includes("capsule") ||
    lowered.includes("oral") ||
    lowered.includes("solution") ||
    lowered.includes("suspension") ||
    lowered.includes("syrup") ||
    lowered.includes("elixir") ||
    lowered.includes("lozenge")
  ) {
    return "ORAL";
  }

  if (
    lowered.includes("topical") ||
    lowered.includes("cream") ||
    lowered.includes("ointment") ||
    lowered.includes("gel") ||
    lowered.includes("lotion")
  ) {
    return "TOPICAL";
  }

  if (lowered.includes("patch") || lowered.includes("transdermal")) {
    return "TRANSDERMAL";
  }

  if (lowered.includes("injection") || lowered.includes("injectable")) {
    if (lowered.includes("intravenous") || lowered.includes(" iv ")) {
      return "INJECTION_IV";
    }
    if (lowered.includes("subcutaneous") || lowered.includes(" sc ")) {
      return "INJECTION_SC";
    }
    return "INJECTION_IM";
  }

  if (
    lowered.includes("inhalation") ||
    lowered.includes("inhaler") ||
    lowered.includes("nebulizer") ||
    lowered.includes("aerosol")
  ) {
    return "INHALATION";
  }

  if (lowered.includes("sublingual")) {
    return "SUBLINGUAL";
  }

  if (lowered.includes("suppository") || lowered.includes("rectal")) {
    return "RECTAL";
  }

  if (lowered.includes("ophthalmic") || lowered.includes("eye drop")) {
    return "OPHTHALMIC";
  }

  if (lowered.includes("otic") || lowered.includes("ear drop")) {
    return "OTIC";
  }

  if (lowered.includes("nasal") || lowered.includes("nose")) {
    return "NASAL";
  }

  return "OTHER";
}

// Extract strength from drug name (e.g., "10 MG", "500 MCG", "0.5 ML")
function extractStrength(name: string): string {
  const strengthMatch = name.match(
    /(\d+(?:\.\d+)?)\s*(MG|MCG|ML|%|UNIT|MEQ|GM|G|IU)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:MG|MCG|ML|%|UNIT|MEQ|GM|G|IU))?/i
  );
  return strengthMatch ? strengthMatch[0] : "";
}

// Extract form from drug name (e.g., "Oral Tablet", "Injectable Solution")
function extractForm(name: string): string {
  const forms = [
    "Oral Tablet",
    "Oral Capsule",
    "Oral Solution",
    "Oral Suspension",
    "Extended Release Tablet",
    "Delayed Release Tablet",
    "Chewable Tablet",
    "Disintegrating Tablet",
    "Injectable Solution",
    "Injectable Suspension",
    "Injection",
    "Topical Cream",
    "Topical Ointment",
    "Topical Gel",
    "Topical Lotion",
    "Topical Solution",
    "Transdermal Patch",
    "Inhalation Powder",
    "Inhalation Aerosol",
    "Inhalation Solution",
    "Metered Dose Inhaler",
    "Nasal Spray",
    "Nasal Solution",
    "Ophthalmic Solution",
    "Ophthalmic Drops",
    "Otic Solution",
    "Otic Drops",
    "Rectal Suppository",
    "Sublingual Tablet",
    "Vaginal Cream",
    "Vaginal Tablet",
  ];

  for (const form of forms) {
    if (name.toLowerCase().includes(form.toLowerCase())) {
      return form;
    }
  }

  // Fallback: try to extract common form words
  const formMatch = name.match(
    /(Tablet|Capsule|Solution|Suspension|Cream|Ointment|Gel|Patch|Injection|Spray|Drops|Powder|Syrup)/i
  );
  return formMatch ? formMatch[1] : "";
}

// Extract generic name from full drug name
// Format: "generic name strength form [Brand Name]" or "Brand Name strength form"
function extractGenericName(name: string, originalQuery: string): string {
  // Remove brand name in brackets if present
  const withoutBrand = name.replace(/\s*\[.*?\]\s*/g, "").trim();

  // Remove strength and form to get base name
  const genericName = withoutBrand
    .replace(
      /\d+(?:\.\d+)?\s*(?:MG|MCG|ML|%|UNIT|MEQ|GM|G|IU)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:MG|MCG|ML|%|UNIT|MEQ|GM|G|IU))?\s*/gi,
      ""
    )
    .replace(
      /(Oral Tablet|Oral Capsule|Oral Solution|Extended Release|Delayed Release|Chewable|Disintegrating|Injectable|Injection|Topical|Transdermal|Inhalation|Nasal|Ophthalmic|Otic|Rectal|Sublingual|Vaginal|Tablet|Capsule|Solution|Suspension|Cream|Ointment|Gel|Patch|Spray|Drops|Powder|Syrup|Metered Dose Inhaler|Aerosol|Lotion)/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  return genericName || originalQuery;
}

// GET /api/medications/search?q=lipitor&limit=10
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") || "15", 10), 50);

    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { error: "Search query must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Search RxNorm for drugs
    const rxnormUrl = new URL(`${RXNORM_API_BASE}/drugs.json`);
    rxnormUrl.searchParams.set("name", query.trim());

    const response = await fetch(rxnormUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Cache for 1 hour to reduce API calls
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("RxNorm API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch medications from RxNorm API" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as RxNormDrugsResponse;

    // Extract drugs from concept groups
    // We prioritize SBD (Semantic Branded Drug) and SCD (Semantic Clinical Drug) types
    const results: MedicationSearchResult[] = [];
    const seenRxcui = new Set<string>();

    const conceptGroups = data.drugGroup?.conceptGroup || [];

    // Priority order for term types
    const priorityTtys = ["SBD", "SCD", "GPCK", "BPCK"];

    for (const tty of priorityTtys) {
      const group = conceptGroups.find((g) => g.tty === tty);
      if (group?.conceptProperties) {
        for (const drug of group.conceptProperties) {
          if (seenRxcui.has(drug.rxcui)) continue;
          seenRxcui.add(drug.rxcui);

          const strength = extractStrength(drug.name);
          const form = extractForm(drug.name);
          const route = mapFormToRoute(drug.name);
          const genericName = extractGenericName(drug.name, query);

          // Use synonym if available (often more readable)
          const displayName = drug.synonym || drug.name;

          results.push({
            rxcui: drug.rxcui,
            name: displayName,
            genericName,
            strength,
            form,
            route,
          });

          if (results.length >= limit) break;
        }
      }
      if (results.length >= limit) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching medications from RxNorm:", error);
    return NextResponse.json(
      { error: "Failed to search medications" },
      { status: 500 }
    );
  }
}
