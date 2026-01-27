/**
 * EDI 837P Professional Claim Generator
 *
 * Generates HIPAA-compliant EDI 837P files for Medicaid claim submission.
 * Follows the X12 5010 standard.
 */

import { format } from "date-fns";

// Types for claim data
export interface EDI837PSubmitter {
  name: string;
  identifier: string; // Usually NPI or ETIN
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export interface EDI837PReceiver {
  name: string;
  identifier: string; // Payer ID
}

export interface EDI837PProvider {
  npi: string;
  taxId: string;
  taxonomyCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

export interface EDI837PPatient {
  medicaidId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: Date;
  gender?: "M" | "F" | "U";
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

export interface EDI837PServiceLine {
  lineNumber: number;
  serviceDate: Date;
  hcpcsCode: string;
  modifiers?: string[];
  units: number;
  unitRate: number;
  lineAmount: number;
  diagnosisPointers: string[]; // e.g., ["1", "2"]
  placeOfService?: string;
  description?: string;
}

export interface EDI837PClaim {
  claimNumber: string;
  serviceStartDate: Date;
  serviceEndDate: Date;
  patient: EDI837PPatient;
  diagnosisCodes: string[]; // ICD-10 codes
  totalAmount: number;
  placeOfService: string; // 12 = Home
  frequencyCode?: string; // 1 = Original, 7 = Replace, 8 = Void
  serviceLines: EDI837PServiceLine[];
  priorAuthNumber?: string;
  notes?: string;
}

export interface EDI837PBatch {
  submitter: EDI837PSubmitter;
  receiver: EDI837PReceiver;
  provider: EDI837PProvider;
  claims: EDI837PClaim[];
  interchangeControlNumber?: string;
  groupControlNumber?: string;
}

// Element and segment delimiters
const ELEMENT_SEPARATOR = "*";
const SEGMENT_TERMINATOR = "~";
const COMPONENT_SEPARATOR = ":";
const REPETITION_SEPARATOR = "^";

// Helper to format date as CCYYMMDD
function formatDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

// Helper to format date as YYMMDD (for ISA)
function formatDateShort(date: Date): string {
  return format(date, "yyMMdd");
}

// Helper to format time as HHMM
function formatTime(date: Date): string {
  return format(date, "HHmm");
}

// Pad string to fixed length with spaces (right-pad)
function padRight(str: string, length: number): string {
  return str.padEnd(length, " ");
}

// Pad string to fixed length with zeros (left-pad)
function padLeft(str: string, length: number, char: string = "0"): string {
  return str.padStart(length, char);
}

// Clean string for EDI (remove special characters)
function cleanString(str: string): string {
  return str
    .replace(/[~*:^]/g, "")
    .replace(/\n/g, " ")
    .trim();
}

// Format phone number (remove all non-digits)
function formatPhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

// Build a segment from elements
function segment(...elements: (string | undefined)[]): string {
  // Remove trailing empty elements
  const filtered = [...elements];
  while (filtered.length > 0 && !filtered[filtered.length - 1]) {
    filtered.pop();
  }
  return filtered.join(ELEMENT_SEPARATOR) + SEGMENT_TERMINATOR;
}

/**
 * Generate a complete EDI 837P file from a batch of claims
 */
export function generateEDI837P(batch: EDI837PBatch): string {
  const segments: string[] = [];
  const now = new Date();

  // Generate control numbers if not provided
  const interchangeControlNumber =
    batch.interchangeControlNumber ||
    padLeft(String(Math.floor(Math.random() * 999999999)), 9);
  const groupControlNumber =
    batch.groupControlNumber ||
    padLeft(String(Math.floor(Math.random() * 999999999)), 9);

  let transactionSetControlNumber = 0;
  let hlCounter = 0;

  // ISA - Interchange Control Header (fixed length fields)
  segments.push(
    segment(
      "ISA",
      "00", // ISA01 - Authorization Information Qualifier
      padRight("", 10), // ISA02 - Authorization Information
      "00", // ISA03 - Security Information Qualifier
      padRight("", 10), // ISA04 - Security Information
      "ZZ", // ISA05 - Interchange ID Qualifier (Mutually Defined)
      padRight(batch.submitter.identifier, 15), // ISA06 - Interchange Sender ID
      "ZZ", // ISA07 - Interchange ID Qualifier
      padRight(batch.receiver.identifier, 15), // ISA08 - Interchange Receiver ID
      formatDateShort(now), // ISA09 - Interchange Date
      formatTime(now), // ISA10 - Interchange Time
      REPETITION_SEPARATOR, // ISA11 - Repetition Separator
      "00501", // ISA12 - Interchange Control Version Number
      interchangeControlNumber, // ISA13 - Interchange Control Number
      "0", // ISA14 - Acknowledgment Requested
      "P", // ISA15 - Usage Indicator (P=Production, T=Test)
      COMPONENT_SEPARATOR // ISA16 - Component Element Separator
    )
  );

  // GS - Functional Group Header
  segments.push(
    segment(
      "GS",
      "HC", // GS01 - Functional Identifier Code (Health Care Claim)
      batch.submitter.identifier, // GS02 - Application Sender's Code
      batch.receiver.identifier, // GS03 - Application Receiver's Code
      formatDate(now), // GS04 - Date
      formatTime(now), // GS05 - Time
      groupControlNumber, // GS06 - Group Control Number
      "X", // GS07 - Responsible Agency Code
      "005010X222A1" // GS08 - Version/Release/Industry ID Code
    )
  );

  // Process each claim as a transaction set
  for (const claim of batch.claims) {
    transactionSetControlNumber++;
    const tsControlNum = padLeft(String(transactionSetControlNumber), 4);
    let segmentCount = 0;

    const claimSegments: string[] = [];

    // ST - Transaction Set Header
    claimSegments.push(
      segment(
        "ST",
        "837", // ST01 - Transaction Set Identifier Code
        tsControlNum, // ST02 - Transaction Set Control Number
        "005010X222A1" // ST03 - Implementation Convention Reference
      )
    );
    segmentCount++;

    // BHT - Beginning of Hierarchical Transaction
    claimSegments.push(
      segment(
        "BHT",
        "0019", // BHT01 - Hierarchical Structure Code
        "00", // BHT02 - Transaction Set Purpose Code (Original)
        claim.claimNumber, // BHT03 - Reference Identification
        formatDate(now), // BHT04 - Date
        formatTime(now), // BHT05 - Time
        "CH" // BHT06 - Transaction Type Code (Chargeable)
      )
    );
    segmentCount++;

    // Loop 1000A - Submitter Name
    claimSegments.push(
      segment(
        "NM1",
        "41", // NM101 - Entity Identifier Code (Submitter)
        "2", // NM102 - Entity Type Qualifier (Non-Person Entity)
        cleanString(batch.submitter.name), // NM103 - Name Last or Organization Name
        "", // NM104 - Name First
        "", // NM105 - Name Middle
        "", // NM106 - Name Prefix
        "", // NM107 - Name Suffix
        "46", // NM108 - ID Code Qualifier (ETIN)
        batch.submitter.identifier // NM109 - ID Code
      )
    );
    segmentCount++;

    // PER - Submitter EDI Contact Information
    const perElements = [
      "PER",
      "IC", // PER01 - Contact Function Code (Information Contact)
      cleanString(batch.submitter.contactName), // PER02 - Name
      "TE", // PER03 - Communication Number Qualifier (Telephone)
      formatPhone(batch.submitter.contactPhone), // PER04 - Communication Number
    ];
    if (batch.submitter.contactEmail) {
      perElements.push("EM"); // PER05 - Communication Number Qualifier (Email)
      perElements.push(batch.submitter.contactEmail); // PER06 - Communication Number
    }
    claimSegments.push(segment(...perElements));
    segmentCount++;

    // Loop 1000B - Receiver Name
    claimSegments.push(
      segment(
        "NM1",
        "40", // NM101 - Entity Identifier Code (Receiver)
        "2", // NM102 - Entity Type Qualifier
        cleanString(batch.receiver.name), // NM103 - Name
        "", // NM104-NM107
        "",
        "",
        "",
        "46", // NM108 - ID Code Qualifier
        batch.receiver.identifier // NM109 - ID Code
      )
    );
    segmentCount++;

    // HL - Hierarchical Level (Billing Provider - Level 1)
    hlCounter = 1;
    claimSegments.push(
      segment(
        "HL",
        String(hlCounter), // HL01 - Hierarchical ID Number
        "", // HL02 - Hierarchical Parent ID Number
        "20", // HL03 - Hierarchical Level Code (Information Source)
        "1" // HL04 - Hierarchical Child Code
      )
    );
    segmentCount++;

    // PRV - Billing Provider Specialty Information
    claimSegments.push(
      segment(
        "PRV",
        "BI", // PRV01 - Provider Code (Billing)
        "PXC", // PRV02 - Reference Identification Qualifier (Taxonomy)
        batch.provider.taxonomyCode // PRV03 - Reference Identification
      )
    );
    segmentCount++;

    // Loop 2010AA - Billing Provider Name
    claimSegments.push(
      segment(
        "NM1",
        "85", // NM101 - Entity Identifier Code (Billing Provider)
        "2", // NM102 - Entity Type Qualifier
        cleanString(batch.provider.name), // NM103 - Name
        "", // NM104-NM107
        "",
        "",
        "",
        "XX", // NM108 - ID Code Qualifier (NPI)
        batch.provider.npi // NM109 - NPI
      )
    );
    segmentCount++;

    // N3 - Billing Provider Address
    claimSegments.push(
      segment(
        "N3",
        cleanString(batch.provider.address) // N301 - Address Line 1
      )
    );
    segmentCount++;

    // N4 - Billing Provider City/State/Zip
    claimSegments.push(
      segment(
        "N4",
        cleanString(batch.provider.city), // N401 - City
        batch.provider.state.toUpperCase(), // N402 - State
        batch.provider.zip.replace(/-/g, "") // N403 - Zip
      )
    );
    segmentCount++;

    // REF - Billing Provider Tax ID
    claimSegments.push(
      segment(
        "REF",
        "EI", // REF01 - Reference Identification Qualifier (Employer ID)
        batch.provider.taxId.replace(/-/g, "") // REF02 - Reference Identification
      )
    );
    segmentCount++;

    // HL - Hierarchical Level (Subscriber - Level 2)
    hlCounter++;
    claimSegments.push(
      segment(
        "HL",
        String(hlCounter), // HL01 - Hierarchical ID Number
        "1", // HL02 - Hierarchical Parent ID Number
        "22", // HL03 - Hierarchical Level Code (Subscriber)
        "0" // HL04 - Hierarchical Child Code (No dependents)
      )
    );
    segmentCount++;

    // SBR - Subscriber Information
    claimSegments.push(
      segment(
        "SBR",
        "P", // SBR01 - Payer Responsibility Sequence Number Code (Primary)
        "18", // SBR02 - Individual Relationship Code (Self)
        "", // SBR03 - Reference Identification
        "", // SBR04 - Name
        "MC", // SBR05 - Insurance Type Code (Medicaid)
        "", // SBR06-SBR08
        "",
        "",
        "MC" // SBR09 - Claim Filing Indicator Code (Medicaid)
      )
    );
    segmentCount++;

    // Loop 2010BA - Subscriber Name
    claimSegments.push(
      segment(
        "NM1",
        "IL", // NM101 - Entity Identifier Code (Insured)
        "1", // NM102 - Entity Type Qualifier (Person)
        cleanString(claim.patient.lastName), // NM103 - Last Name
        cleanString(claim.patient.firstName), // NM104 - First Name
        claim.patient.middleName
          ? cleanString(claim.patient.middleName)
          : undefined, // NM105 - Middle Name
        "", // NM106 - Prefix
        "", // NM107 - Suffix
        "MI", // NM108 - ID Code Qualifier (Member ID)
        claim.patient.medicaidId // NM109 - Medicaid ID
      )
    );
    segmentCount++;

    // N3 - Subscriber Address
    claimSegments.push(
      segment(
        "N3",
        cleanString(claim.patient.address) // N301 - Address
      )
    );
    segmentCount++;

    // N4 - Subscriber City/State/Zip
    claimSegments.push(
      segment(
        "N4",
        cleanString(claim.patient.city), // N401 - City
        claim.patient.state.toUpperCase(), // N402 - State
        claim.patient.zip.replace(/-/g, "") // N403 - Zip
      )
    );
    segmentCount++;

    // DMG - Subscriber Demographic Information
    claimSegments.push(
      segment(
        "DMG",
        "D8", // DMG01 - Date Time Period Format Qualifier
        formatDate(claim.patient.dob), // DMG02 - Date of Birth
        claim.patient.gender || "U" // DMG03 - Gender Code
      )
    );
    segmentCount++;

    // Loop 2010BB - Payer Name
    claimSegments.push(
      segment(
        "NM1",
        "PR", // NM101 - Entity Identifier Code (Payer)
        "2", // NM102 - Entity Type Qualifier
        cleanString(batch.receiver.name), // NM103 - Payer Name
        "", // NM104-NM107
        "",
        "",
        "",
        "PI", // NM108 - ID Code Qualifier (Payer ID)
        batch.receiver.identifier // NM109 - Payer ID
      )
    );
    segmentCount++;

    // Loop 2300 - Claim Information
    claimSegments.push(
      segment(
        "CLM",
        claim.claimNumber, // CLM01 - Claim Submitter's Identifier
        claim.totalAmount.toFixed(2), // CLM02 - Total Claim Charge Amount
        "", // CLM03
        "", // CLM04
        `${claim.placeOfService}${COMPONENT_SEPARATOR}B${COMPONENT_SEPARATOR}1`, // CLM05 - Place of Service:Facility Code Qualifier:Claim Frequency Code
        "Y", // CLM06 - Provider or Supplier Signature Indicator
        "A", // CLM07 - Assignment of Benefits Indicator
        "Y", // CLM08 - Benefits Assignment Certification Indicator
        "Y" // CLM09 - Release of Information Code
      )
    );
    segmentCount++;

    // DTP - Service Date Range
    if (claim.serviceStartDate.getTime() === claim.serviceEndDate.getTime()) {
      claimSegments.push(
        segment(
          "DTP",
          "472", // DTP01 - Date/Time Qualifier (Service)
          "D8", // DTP02 - Date Time Period Format Qualifier
          formatDate(claim.serviceStartDate) // DTP03 - Date
        )
      );
    } else {
      claimSegments.push(
        segment(
          "DTP",
          "472", // DTP01 - Date/Time Qualifier (Service)
          "RD8", // DTP02 - Date Time Period Format Qualifier (Range)
          `${formatDate(claim.serviceStartDate)}-${formatDate(claim.serviceEndDate)}` // DTP03 - Date Range
        )
      );
    }
    segmentCount++;

    // REF - Prior Authorization Number (if present)
    if (claim.priorAuthNumber) {
      claimSegments.push(
        segment(
          "REF",
          "G1", // REF01 - Reference Identification Qualifier (Prior Auth)
          claim.priorAuthNumber // REF02 - Reference Identification
        )
      );
      segmentCount++;
    }

    // HI - Health Care Diagnosis Codes
    const diagnosisElements = ["HI"];
    claim.diagnosisCodes.slice(0, 12).forEach((code, index) => {
      const qualifier = index === 0 ? "ABK" : "ABF"; // ABK=Principal, ABF=Secondary
      diagnosisElements.push(
        `${qualifier}${COMPONENT_SEPARATOR}${code.replace(/\./g, "")}`
      );
    });
    claimSegments.push(segment(...diagnosisElements));
    segmentCount++;

    // Loop 2400 - Service Lines
    for (const line of claim.serviceLines) {
      // LX - Service Line Number
      claimSegments.push(
        segment(
          "LX",
          String(line.lineNumber) // LX01 - Line Number
        )
      );
      segmentCount++;

      // SV1 - Professional Service
      const sv1Composite = [
        "HC", // Product/Service ID Qualifier (HCPCS)
        line.hcpcsCode,
        ...(line.modifiers || []).slice(0, 4),
      ].join(COMPONENT_SEPARATOR);

      claimSegments.push(
        segment(
          "SV1",
          sv1Composite, // SV101 - Composite Medical Procedure Identifier
          line.lineAmount.toFixed(2), // SV102 - Line Item Charge Amount
          "UN", // SV103 - Unit or Basis for Measurement Code (Unit)
          line.units.toFixed(2), // SV104 - Service Unit Count
          line.placeOfService || claim.placeOfService, // SV105 - Place of Service Code
          "", // SV106
          line.diagnosisPointers.join(COMPONENT_SEPARATOR) // SV107 - Composite Diagnosis Code Pointer
        )
      );
      segmentCount++;

      // DTP - Service Line Date
      claimSegments.push(
        segment(
          "DTP",
          "472", // DTP01 - Date/Time Qualifier (Service)
          "D8", // DTP02 - Date Time Period Format Qualifier
          formatDate(line.serviceDate) // DTP03 - Date
        )
      );
      segmentCount++;
    }

    // SE - Transaction Set Trailer
    segmentCount++; // Include SE itself
    claimSegments.push(
      segment(
        "SE",
        String(segmentCount), // SE01 - Number of Included Segments
        tsControlNum // SE02 - Transaction Set Control Number
      )
    );

    segments.push(...claimSegments);
  }

  // GE - Functional Group Trailer
  segments.push(
    segment(
      "GE",
      String(transactionSetControlNumber), // GE01 - Number of Transaction Sets
      groupControlNumber // GE02 - Group Control Number
    )
  );

  // IEA - Interchange Control Trailer
  segments.push(
    segment(
      "IEA",
      "1", // IEA01 - Number of Included Functional Groups
      interchangeControlNumber // IEA02 - Interchange Control Number
    )
  );

  return segments.join("\n");
}

/**
 * Validate a batch before generating EDI
 */
export interface ValidationError {
  field: string;
  message: string;
  claimNumber?: string;
}

export function validateBatch(batch: EDI837PBatch): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate submitter
  if (!batch.submitter.identifier) {
    errors.push({
      field: "submitter.identifier",
      message: "Submitter identifier is required",
    });
  }
  if (!batch.submitter.name) {
    errors.push({
      field: "submitter.name",
      message: "Submitter name is required",
    });
  }
  if (!batch.submitter.contactName) {
    errors.push({
      field: "submitter.contactName",
      message: "Submitter contact name is required",
    });
  }
  if (!batch.submitter.contactPhone) {
    errors.push({
      field: "submitter.contactPhone",
      message: "Submitter contact phone is required",
    });
  }

  // Validate receiver
  if (!batch.receiver.identifier) {
    errors.push({
      field: "receiver.identifier",
      message: "Receiver/Payer identifier is required",
    });
  }
  if (!batch.receiver.name) {
    errors.push({
      field: "receiver.name",
      message: "Receiver/Payer name is required",
    });
  }

  // Validate provider
  if (!batch.provider.npi || !/^\d{10}$/.test(batch.provider.npi)) {
    errors.push({
      field: "provider.npi",
      message: "Provider NPI must be exactly 10 digits",
    });
  }
  if (
    !batch.provider.taxId ||
    !/^\d{9}$/.test(batch.provider.taxId.replace(/-/g, ""))
  ) {
    errors.push({
      field: "provider.taxId",
      message: "Provider Tax ID must be exactly 9 digits",
    });
  }
  if (!batch.provider.taxonomyCode) {
    errors.push({
      field: "provider.taxonomyCode",
      message: "Provider taxonomy code is required",
    });
  }
  if (!batch.provider.name) {
    errors.push({
      field: "provider.name",
      message: "Provider name is required",
    });
  }
  if (!batch.provider.address) {
    errors.push({
      field: "provider.address",
      message: "Provider address is required",
    });
  }
  if (!batch.provider.city) {
    errors.push({
      field: "provider.city",
      message: "Provider city is required",
    });
  }
  if (!batch.provider.state || !/^[A-Z]{2}$/i.test(batch.provider.state)) {
    errors.push({
      field: "provider.state",
      message: "Provider state must be a 2-letter code",
    });
  }
  if (!batch.provider.zip) {
    errors.push({
      field: "provider.zip",
      message: "Provider zip code is required",
    });
  }

  // Validate claims
  if (batch.claims.length === 0) {
    errors.push({
      field: "claims",
      message: "At least one claim is required",
    });
  }

  for (const claim of batch.claims) {
    // Patient validation
    if (!claim.patient.medicaidId) {
      errors.push({
        field: "patient.medicaidId",
        message: "Patient Medicaid ID is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.firstName) {
      errors.push({
        field: "patient.firstName",
        message: "Patient first name is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.lastName) {
      errors.push({
        field: "patient.lastName",
        message: "Patient last name is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.dob) {
      errors.push({
        field: "patient.dob",
        message: "Patient date of birth is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.address) {
      errors.push({
        field: "patient.address",
        message: "Patient address is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.city) {
      errors.push({
        field: "patient.city",
        message: "Patient city is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.state) {
      errors.push({
        field: "patient.state",
        message: "Patient state is required",
        claimNumber: claim.claimNumber,
      });
    }
    if (!claim.patient.zip) {
      errors.push({
        field: "patient.zip",
        message: "Patient zip code is required",
        claimNumber: claim.claimNumber,
      });
    }

    // Diagnosis validation
    if (!claim.diagnosisCodes || claim.diagnosisCodes.length === 0) {
      errors.push({
        field: "diagnosisCodes",
        message: "At least one diagnosis code is required",
        claimNumber: claim.claimNumber,
      });
    }

    // Service lines validation
    if (!claim.serviceLines || claim.serviceLines.length === 0) {
      errors.push({
        field: "serviceLines",
        message: "At least one service line is required",
        claimNumber: claim.claimNumber,
      });
    }

    for (const line of claim.serviceLines) {
      if (!line.hcpcsCode) {
        errors.push({
          field: `serviceLine[${line.lineNumber}].hcpcsCode`,
          message: "HCPCS code is required",
          claimNumber: claim.claimNumber,
        });
      }
      if (line.units <= 0) {
        errors.push({
          field: `serviceLine[${line.lineNumber}].units`,
          message: "Units must be greater than 0",
          claimNumber: claim.claimNumber,
        });
      }
      if (line.lineAmount <= 0) {
        errors.push({
          field: `serviceLine[${line.lineNumber}].lineAmount`,
          message: "Line amount must be greater than 0",
          claimNumber: claim.claimNumber,
        });
      }
      if (!line.diagnosisPointers || line.diagnosisPointers.length === 0) {
        errors.push({
          field: `serviceLine[${line.lineNumber}].diagnosisPointers`,
          message: "At least one diagnosis pointer is required",
          claimNumber: claim.claimNumber,
        });
      }
    }

    // Total validation
    const calculatedTotal = claim.serviceLines.reduce(
      (sum, line) => sum + line.lineAmount,
      0
    );
    if (Math.abs(calculatedTotal - claim.totalAmount) > 0.01) {
      errors.push({
        field: "totalAmount",
        message: `Total amount (${claim.totalAmount}) does not match sum of line amounts (${calculatedTotal})`,
        claimNumber: claim.claimNumber,
      });
    }
  }

  return errors;
}

/**
 * Generate filename for EDI file
 */
export function generateEDIFilename(
  companyName: string,
  batchId?: string
): string {
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const cleanCompany = companyName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
  const suffix = batchId ? `_${batchId}` : "";
  return `837P_${cleanCompany}_${timestamp}${suffix}.edi`;
}

/**
 * Parse claim status from 999/277 response (basic implementation)
 */
export interface AcknowledgmentResult {
  accepted: boolean;
  transactionSetId?: string;
  errors?: string[];
}

export function parseAcknowledgment(ediContent: string): AcknowledgmentResult {
  // Basic parsing for 999 acknowledgment
  // In production, this would need full X12 parsing
  const isAccepted = ediContent.includes("IK5*A") || ediContent.includes("AK9*A");
  const isRejected =
    ediContent.includes("IK5*R") ||
    ediContent.includes("AK9*R") ||
    ediContent.includes("IK5*E") ||
    ediContent.includes("AK9*E");

  const errors: string[] = [];

  // Extract error codes (simplified)
  const ik4Matches = ediContent.match(/IK4\*[^~]+/g);
  if (ik4Matches) {
    errors.push(...ik4Matches);
  }

  return {
    accepted: isAccepted && !isRejected,
    errors: errors.length > 0 ? errors : undefined,
  };
}
