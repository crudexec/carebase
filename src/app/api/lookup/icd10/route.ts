import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * ICD-10 Code Lookup API
 *
 * Proxies requests to the NIH ClinicalTables API for ICD-10-CM code lookup.
 *
 * API Documentation: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
 */

const NIH_API_BASE = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";

interface ICD10SearchResult {
  code: string;
  description: string;
}

interface ICD10Response {
  results: ICD10SearchResult[];
  total: number;
}

// GET /api/lookup/icd10?terms=diabetes&maxList=20
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const terms = searchParams.get("terms");
    const maxList = parseInt(searchParams.get("maxList") || "20", 10);

    if (!terms || terms.trim().length < 2) {
      return NextResponse.json(
        { error: "Search terms must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Build NIH API URL
    // sf=code,name - search both code and description fields
    // df=code,name - return code and description in display strings
    const nihUrl = new URL(NIH_API_BASE);
    nihUrl.searchParams.set("terms", terms.trim());
    nihUrl.searchParams.set("maxList", Math.min(maxList, 100).toString()); // Cap at 100
    nihUrl.searchParams.set("sf", "code,name"); // Search fields
    nihUrl.searchParams.set("df", "code,name"); // Display fields

    const response = await fetch(nihUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Cache for 1 hour to reduce API calls
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("NIH API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch ICD-10 codes from NIH API" },
        { status: 502 }
      );
    }

    const data = await response.json();

    // NIH API returns array: [totalCount, codes[], extraData, displayStrings[]]
    // displayStrings is array of [code, description] pairs
    const [total, , , displayStrings] = data as [
      number,
      string[],
      null,
      [string, string][]
    ];

    // Transform to our format
    const results: ICD10SearchResult[] = (displayStrings || []).map(
      ([code, description]: [string, string]) => ({
        code,
        description,
      })
    );

    const responseData: ICD10Response = {
      results,
      total,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching ICD-10 codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch ICD-10 codes" },
      { status: 500 }
    );
  }
}
