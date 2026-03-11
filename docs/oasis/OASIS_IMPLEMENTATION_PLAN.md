# OASIS-E2 Assessment Implementation Plan

## Executive Summary

This document outlines the implementation plan for adding OASIS-E2 (Outcome and Assessment Information Set) assessment capabilities to Carebase. OASIS-E2 is a CMS-mandated standardized assessment tool for home health agencies, effective April 1, 2026.

**Scope:** Implement a complete OASIS-E2 assessment system by enhancing the existing form creator with new field types, complex skip logic, time-point management, and CMS compliance features.

---

## Table of Contents

1. [OASIS-E2 Overview](#1-oasis-e2-overview)
2. [Current System Analysis](#2-current-system-analysis)
3. [Gap Analysis](#3-gap-analysis)
4. [Implementation Phases](#4-implementation-phases)
5. [Technical Specifications](#5-technical-specifications)
6. [Questions for Clarification](#6-questions-for-clarification)
7. [Database Schema Changes](#7-database-schema-changes)
8. [New Components Required](#8-new-components-required)
9. [Testing Strategy](#9-testing-strategy)
10. [Compliance Considerations](#10-compliance-considerations)

---

## 1. OASIS-E2 Overview

### 1.1 What is OASIS?

OASIS (Outcome and Assessment Information Set) is a standardized data collection tool required by CMS for:

- Medicare/Medicaid home health reimbursement (PDGM - Patient-Driven Groupings Model)
- Quality reporting and outcome measurement
- Care planning documentation

### 1.2 OASIS-E2 Structure (36 pages, 17 sections)

| Section | Name                              | Items                    | Key Complexity                             |
| ------- | --------------------------------- | ------------------------ | ------------------------------------------ |
| A       | Administrative Information        | M0010-M0104, A1255-A2124 | Dates, IDs, skip logic                     |
| B       | Hearing, Speech, and Vision       | B0200-B1300              | Coded scales                               |
| C       | Cognitive Patterns                | C0100-C1310              | BIMS scoring (0-15), CAM                   |
| D       | Mood                              | D0150-D0700              | PHQ-2 to PHQ-9 (0-27), conditional         |
| E       | Behavior                          | M1740-M1745              | Multi-select, frequency                    |
| F       | Preferences for Customary Routine | M1100, M2102             | Matrix grid (3x5)                          |
| G       | Functional Status                 | M1800-M1860              | 6-7 point scales                           |
| GG      | Functional Abilities              | GG0100-GG0170            | Complex 6-point scale, time-point specific |
| H       | Bladder and Bowel                 | M1600-M1630              | Conditional items                          |
| I       | Active Diagnoses                  | M1021-M1028              | ICD-10-CM, multiple entry                  |
| J       | Health Conditions                 | M1033-J1900              | Pain scales, fall tracking                 |
| K       | Swallowing/Nutritional Status     | M1060, K0520, M1870      | Height/weight, time-specific               |
| M       | Skin Conditions                   | M1306-M1342              | Pressure ulcer staging, counts             |
| N       | Medications                       | N0415-M2030              | Drug classes, ability scales               |
| O       | Special Treatments                | O0110, M1041-M1046       | Multi-select checklist, vaccines           |
| Q       | Participation in Assessment       | M2401                    | Intervention tracking                      |

### 1.3 Time Points (Assessment Types)

OASIS assessments vary by "time point" - different items are collected at different stages:

| Time Point                | Code | When Used                                     |
| ------------------------- | ---- | --------------------------------------------- |
| Start of Care             | SOC  | Initial assessment within 5 days of admission |
| Resumption of Care        | ROC  | After inpatient stay                          |
| Follow-up/Recertification | FU   | Every 60-day certification period             |
| Transfer                  | TRN  | Transfer to inpatient facility                |
| Discharge                 | DC   | Discharge from agency                         |
| Death at Home             | DAH  | Patient death                                 |

### 1.4 Skip Logic Complexity

OASIS has extensive branching logic. Examples:

- "If M1306 = 0 → Skip to M1322"
- "If SOC/ROC performance is coded 07, 09, 10 or 88 → Skip to GG0170M"
- "Skip to B1300, Health Literacy at Discharge" (context-aware skips)

---

## 2. Current System Analysis

### 2.1 Existing Form Creator Capabilities

**Database Models (prisma/schema.prisma):**

- `FormTemplate` - Template with version, status, type
- `FormSection` - Grouped sections with order
- `FormField` - Individual fields with type, config (JSON)

**Field Types Supported:**

- TEXT_SHORT, TEXT_LONG, NUMBER, YES_NO
- SINGLE_CHOICE, MULTIPLE_CHOICE
- DATE, TIME, DATETIME
- SIGNATURE, PHOTO
- RATING_SCALE, BODY_MAP
- ICD10_DIAGNOSIS

**Assessment System (separate but relevant):**

- `AssessmentTemplate` with scoring configuration
- `AssessmentTemplateSection` with section types (KATZ_ADL, PHQ9, etc.)
- `AssessmentTemplateItem` with conditional logic (basic showIf)
- Scoring methods: SUM, AVERAGE, WEIGHTED_SUM, THRESHOLD, CUSTOM

### 2.2 Existing Strengths

1. **Drag-and-drop builder** - @dnd-kit implementation works well
2. **QA workflow** - PENDING_REVIEW, APPROVED, REJECTED states
3. **PDF/Fax export** - Export pipeline exists
4. **ICD-10 search** - Already have diagnosis code lookup
5. **Body map** - Pain/wound location tracking
6. **Schema snapshots** - Immutable form versions on submission

### 2.3 Current Conditional Logic

```typescript
// Current: Basic showIf in AssessmentTemplateItem
conditionalLogic?: {
  dependsOn: string;  // itemId
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}
```

---

## 3. Gap Analysis

### 3.1 Missing Field Types

| Required Type              | Description                        | OASIS Examples                    |
| -------------------------- | ---------------------------------- | --------------------------------- |
| **CODE_ENTRY**             | Single code box with validation    | M0100 (Enter Code)                |
| **MATRIX_GRID**            | Multi-row, multi-column selection  | M1100 Living Situation (3x5 grid) |
| **DATE_PARTS**             | MM-DD-YYYY with individual boxes   | M0030, M0066                      |
| **MULTI_CODE_ENTRY**       | Multiple ICD-10 codes with ratings | M1021, M1023                      |
| **CALCULATED_SCORE**       | Auto-sum with display              | C0500 BIMS Score, D0160 PHQ Score |
| **HIERARCHICAL_SELECT**    | Nested sub-items (A1, A2, A3)      | O0110 Special Treatments          |
| **NUMERIC_COUNTER**        | Enter count (0-n)                  | M1311 Pressure Ulcer Counts       |
| **TIME_POINT_CONDITIONAL** | Different fields per SOC/ROC/DC    | GG0130, GG0170                    |
| **STRUCTURED_ID**          | Formatted input (NPI, SSN, etc.)   | M0018, M0064                      |

### 3.2 Missing Skip Logic Capabilities

| Current Limitation      | Required Capability            |
| ----------------------- | ------------------------------ |
| Single field dependency | Multi-field AND/OR conditions  |
| Basic operators only    | Range checks, "any of" logic   |
| No skip-to targeting    | Jump to specific section/item  |
| No time-point awareness | Different skips per SOC/ROC/DC |
| No skip validation      | Ensure skipped items are null  |

### 3.3 Missing Scoring Features

| Gap                    | OASIS Requirement                    |
| ---------------------- | ------------------------------------ |
| No automatic totaling  | BIMS (C0200-C0400) = 0-15 score      |
| No conditional scoring | PHQ scoring stops if A+B < threshold |
| No sub-score display   | Show section scores during entry     |
| No score validation    | "Enter 99 if unable to complete"     |

### 3.4 Missing Time-Point Management

| Gap                         | Requirement                        |
| --------------------------- | ---------------------------------- |
| No time-point concept       | Track SOC, ROC, FU, TRN, DC        |
| Single form per template    | Different item sets per time-point |
| No prior assessment linking | Compare SOC to DC responses        |
| No time-based validation    | M0030 must be within date range    |

### 3.5 Missing CMS Compliance Features

| Gap                        | Requirement                         |
| -------------------------- | ----------------------------------- |
| No item-level help text    | CMS guidance per item               |
| No OASIS item codes        | M-codes, GG-codes standardized      |
| No export format           | OASIS submission file format        |
| No clinician certification | Track who can complete OASIS        |
| No timing validation       | Assessments within required windows |

---

## 4. Implementation Phases

### Phase 1: Enhanced Form Field Types (Foundation)

**Goal:** Add new field types required for OASIS complexity

**Tasks:**

1. Add new field type enums to Prisma schema
2. Create field components:
   - `CodeEntryField` - Single/multi-digit code input
   - `MatrixGridField` - Row/column grid selector
   - `DatePartsField` - MM-DD-YYYY boxes
   - `HierarchicalCheckboxField` - Parent/child checkboxes
   - `CalculatedScoreField` - Auto-computed totals
   - `NumericCounterField` - Count entry with bounds
   - `StructuredIdField` - Formatted ID inputs
3. Update field-renderer.tsx to handle new types
4. Update field-editor.tsx for type-specific config
5. Add validation schemas for each type

**Deliverables:**

- 8 new field type components
- Updated type definitions
- Field editor configurations
- Validation schemas

### Phase 2: Advanced Skip Logic Engine

**Goal:** Implement complex conditional branching

**Tasks:**

1. Design new skip logic schema:

   ```typescript
   interface SkipLogicRule {
     conditions: SkipCondition[];
     operator: "AND" | "OR";
     action: "skip_to" | "hide" | "disable";
     target: string; // section/item code
     timePoints?: TimePoint[];
   }

   interface SkipCondition {
     itemCode: string;
     operator:
       | "equals"
       | "not_equals"
       | "in"
       | "not_in"
       | "greater_than"
       | "less_than"
       | "range"
       | "is_null"
       | "is_not_null";
     value: any;
   }
   ```

2. Create skip logic evaluator service
3. Build skip logic visual editor
4. Implement skip-to navigation in renderer
5. Add skip logic validation (orphan detection)
6. Handle cascading skips

**Deliverables:**

- Skip logic data model
- Skip logic evaluator
- Skip logic visual editor
- Cascade handler

### Phase 3: Time-Point Management System

**Goal:** Support OASIS time-point-specific assessments

**Tasks:**

1. Add time-point models to schema:
   ```prisma
   enum OasisTimePoint {
     SOC      // Start of Care
     ROC      // Resumption of Care
     FU       // Follow-up
     TRN      // Transfer
     DC       // Discharge
     DAH      // Death at Home
   }
   ```
2. Create time-point template variants
3. Build time-point selector UI
4. Implement item visibility by time-point
5. Link assessments across time-points (SOC → DC comparison)
6. Add time-point validation rules

**Deliverables:**

- Time-point data model
- Time-point selector component
- Assessment linking system
- Validation rules

### Phase 4: OASIS Template Builder

**Goal:** Purpose-built OASIS assessment creator

**Tasks:**

1. Create OASIS section templates (pre-built)
2. Build OASIS item library (all M-codes, GG-codes)
3. Implement CMS help text integration
4. Add response validation per CMS spec
5. Build scoring configuration UI
6. Create OASIS preview mode

**Deliverables:**

- OASIS section library
- OASIS item library (400+ items)
- CMS guidance integration
- OASIS-specific preview

### Phase 5: OASIS Assessment Workflow

**Goal:** Complete OASIS assessment experience

**Tasks:**

1. Build OASIS assessment creation wizard
2. Implement auto-population from patient data
3. Create progress tracking per section
4. Build real-time scoring display
5. Add assessment comparison view
6. Implement save/resume capability
7. Create supervisor review workflow

**Deliverables:**

- Assessment wizard
- Auto-population
- Progress tracker
- Score calculator
- Review interface

### Phase 6: Compliance & Export

**Goal:** CMS submission readiness

**Tasks:**

1. Implement OASIS data validation rules
2. Create OASIS export format (CMS spec)
3. Build submission tracking
4. Add audit logging for changes
5. Create correction/modification workflow
6. Build compliance reporting dashboard

**Deliverables:**

- Validation engine
- Export generator
- Submission tracker
- Audit system
- Correction workflow

---

## 5. Technical Specifications

### 5.1 New Field Type Specifications

#### CODE_ENTRY Field

```typescript
interface CodeEntryFieldConfig {
  codeLength: number; // Number of digits/characters
  allowedValues?: string[]; // Restrict to specific codes
  prefix?: string; // Display prefix (e.g., "Enter Code")
  helpText?: string; // CMS guidance
  validation?: {
    pattern?: string; // Regex pattern
    range?: [number, number]; // Numeric range
  };
}
```

#### MATRIX_GRID Field

```typescript
interface MatrixGridFieldConfig {
  rows: MatrixRow[];
  columns: MatrixColumn[];
  singleSelectPerRow: boolean;
  rowLabels: {
    id: string;
    label: string;
    description?: string;
  }[];
  columnLabels: {
    id: string;
    label: string;
    value: string | number;
  }[];
}

// Example: M1100 Living Situation
{
  rows: [
    { id: 'alone', label: 'A. Patient lives alone' },
    { id: 'with_others', label: 'B. Patient lives with other person(s)' },
    { id: 'congregate', label: 'C. Patient lives in congregate situation' }
  ],
  columns: [
    { id: 'around_clock', label: 'Around the Clock', value: '01' },
    { id: 'regular_day', label: 'Regular Daytime', value: '02' },
    { id: 'regular_night', label: 'Regular Nighttime', value: '03' },
    { id: 'occasional', label: 'Occasional/Short-Term', value: '04' },
    { id: 'none', label: 'No Assistance Available', value: '05' }
  ]
}
```

#### CALCULATED_SCORE Field

```typescript
interface CalculatedScoreFieldConfig {
  sourceItems: string[]; // Item codes to sum
  formula: "SUM" | "AVERAGE" | "CUSTOM";
  customFormula?: string; // JavaScript expression
  displayFormat: string; // e.g., "00-15" or "0-27"
  specialValues?: {
    value: number;
    meaning: string; // e.g., 99 = "Unable to complete"
  }[];
  showBreakdown: boolean; // Show individual scores
}
```

#### HIERARCHICAL_CHECKBOX Field

```typescript
interface HierarchicalCheckboxFieldConfig {
  items: HierarchicalItem[];
  multiSelect: boolean;
  noneOption?: {
    id: string;
    label: string;
    exclusive: boolean; // Clears other selections
  };
}

interface HierarchicalItem {
  id: string;
  label: string;
  code: string;
  children?: HierarchicalItem[];
  indent: number;
}

// Example: O0110 Special Treatments
{
  items: [
    {
      id: "chemo",
      label: "A1. Chemotherapy",
      code: "A1",
      children: [
        { id: "chemo_iv", label: "A2. IV", code: "A2", indent: 1 },
        { id: "chemo_oral", label: "A3. Oral", code: "A3", indent: 1 },
        { id: "chemo_other", label: "A10. Other", code: "A10", indent: 1 },
      ],
    },
    { id: "radiation", label: "B1. Radiation", code: "B1" },
  ];
}
```

### 5.2 Skip Logic Engine Specification

```typescript
// Skip logic evaluation service
class SkipLogicEvaluator {
  evaluate(
    rules: SkipLogicRule[],
    responses: Map<string, any>,
    timePoint: OasisTimePoint,
  ): SkipResult {
    // Returns which items to skip/show
  }

  getNavigationTarget(
    currentItem: string,
    rules: SkipLogicRule[],
    responses: Map<string, any>,
  ): string | null {
    // Returns next item code or null
  }

  validateSkipIntegrity(
    template: OasisTemplate,
    responses: Map<string, any>,
  ): ValidationResult {
    // Ensures no orphaned responses
  }
}

// Skip rule examples from OASIS-E2
const oasisSkipRules: SkipLogicRule[] = [
  {
    // M1306 = 0 → Skip to M1322
    conditions: [{ itemCode: "M1306", operator: "equals", value: 0 }],
    operator: "AND",
    action: "skip_to",
    target: "M1322",
  },
  {
    // GG0170I = 07|09|10|88 → Skip to GG0170M
    conditions: [
      {
        itemCode: "GG0170I",
        operator: "in",
        value: ["07", "09", "10", "88"],
      },
    ],
    operator: "AND",
    action: "skip_to",
    target: "GG0170M",
    timePoints: ["SOC", "ROC"], // Only at these time points
  },
];
```

### 5.3 Time-Point System Specification

```typescript
interface OasisAssessment {
  id: string;
  patientId: string;
  timePoint: OasisTimePoint;
  templateVersion: string;

  // Dates
  m0030_socDate?: Date; // Start of Care date
  m0032_rocDate?: Date; // Resumption of Care date
  m0090_assessmentDate: Date; // Assessment completion date
  m0906_dischargeDate?: Date; // Discharge date

  // Linking
  priorAssessmentId?: string; // Link to SOC for comparisons
  linkedEpisodeId: string; // Episode of care

  // Status
  status: "IN_PROGRESS" | "COMPLETED" | "SUBMITTED" | "CORRECTED";
  submittedAt?: Date;

  // Responses
  responses: Map<string, OasisResponse>;

  // Computed
  scores: {
    bims?: number; // C0500
    phq9?: number; // D0160
    // ... other scores
  };
}

// Item visibility by time point
interface OasisItemTimePointConfig {
  itemCode: string;
  visibleAt: OasisTimePoint[];
  requiredAt: OasisTimePoint[];
  skipLogicOverrides?: {
    timePoint: OasisTimePoint;
    rules: SkipLogicRule[];
  }[];
}
```

---

## 6. Implementation Decisions (CONFIRMED)

The following decisions have been confirmed for implementation:

### 6.1 User Roles & Permissions

| Decision                | Selection                                                |
| ----------------------- | -------------------------------------------------------- |
| **Who completes OASIS** | RN + PT/OT/ST (per CMS discipline rules)                 |
| **Role restrictions**   | Yes - discipline-based field access per CMS requirements |

**Implementation Notes:**

- RN can complete all sections
- PT can complete mobility/functional sections (GG0170)
- OT can complete ADL/IADL sections
- ST can complete swallowing/cognitive sections
- Track assessor discipline in `assessorDiscipline` field

### 6.2 Form Structure

| Decision              | Selection                                              |
| --------------------- | ------------------------------------------------------ |
| **Form architecture** | Unified Form with time-point-aware skip logic          |
| **Template approach** | Single comprehensive template covering all time points |

**Implementation Notes:**

- One `OasisTemplate` covers SOC, ROC, FU, TRN, DC, DAH
- Each `OasisItem` has `visibleAt` and `requiredAt` arrays
- Skip logic includes time-point conditions
- More maintainable than separate templates

### 6.3 CMS Integration

| Decision              | Selection                                  |
| --------------------- | ------------------------------------------ |
| **Submission method** | Export Only                                |
| **Output format**     | Generate files for external OASIS software |

**Implementation Notes:**

- Build export generator for standard OASIS file format
- No direct CMS QIES/ASPEN integration needed
- Support common export formats (flat file, XML)
- Provide download and email options

### 6.4 User Interface

| Decision              | Selection                                 |
| --------------------- | ----------------------------------------- |
| **Layout style**      | Multi-step Wizard with section navigation |
| **Progress tracking** | Section-by-section with progress bar      |

**Implementation Notes:**

- One section per wizard step (17 steps maximum)
- Navigation sidebar showing all sections
- Progress indicator per section
- "Jump to section" capability
- Mobile-responsive but optimized for desktop/tablet

### 6.5 Data Integration

| Decision                         | Selection                                       |
| -------------------------------- | ----------------------------------------------- |
| **Client data auto-populate**    | Yes - Full auto-populate from client profile    |
| **Diagnosis/medication linking** | No - OASIS data entered independently           |
| **Connection mode**              | Online with draft save (no offline requirement) |

**Implementation Notes:**

- Auto-populate: Name, DOB, SSN, Medicare/Medicaid numbers, address
- Auto-populate from client profile on assessment creation
- Editable after population (in case of corrections)
- Diagnoses/medications entered fresh in OASIS (M1021, N0415)
- Auto-save drafts every 60 seconds
- Manual "Save Draft" button available

### 6.6 Validation & UX

| Decision              | Selection                                      |
| --------------------- | ---------------------------------------------- |
| **Validation timing** | On field exit (immediate feedback)             |
| **Error display**     | Inline with field, summary on section complete |

**Implementation Notes:**

- Validate each field as user exits (blur event)
- Show inline error message below field
- Prevent progression to next section if current has errors
- "Fix Errors" summary dialog on section navigation attempt
- Skip logic evaluation happens on field change

### 6.7 MVP Priority

| Decision           | Selection                                          |
| ------------------ | -------------------------------------------------- |
| **Phase priority** | Phase 1 + Phase 4 (Fields + OASIS Builder)         |
| **MVP scope**      | New field types + pre-built OASIS template library |

**Adjusted Phase Order:**

1. **Phase 1:** Enhanced Field Types (Foundation)
2. **Phase 4:** OASIS Template Builder (Pre-built library)
3. **Phase 2:** Advanced Skip Logic Engine
4. **Phase 5:** OASIS Assessment Workflow
5. **Phase 3:** Time-Point Management System
6. **Phase 6:** Compliance & Export

---

## 7. Database Schema Changes

### 7.1 New Enums

```prisma
enum OasisTimePoint {
  SOC   // Start of Care
  ROC   // Resumption of Care
  FU    // Follow-up/Recertification
  TRN   // Transfer
  DC    // Discharge
  DAH   // Death at Home
}

enum OasisStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  SUBMITTED_TO_QA
  QA_APPROVED
  QA_REJECTED
  TRANSMITTED
  CORRECTED
}

// Add to existing FormFieldType enum
enum FormFieldType {
  // ... existing types ...
  CODE_ENTRY
  MATRIX_GRID
  DATE_PARTS
  HIERARCHICAL_CHECKBOX
  CALCULATED_SCORE
  NUMERIC_COUNTER
  STRUCTURED_ID
  MULTI_DIAGNOSIS
}
```

### 7.2 New Models

```prisma
model OasisTemplate {
  id              String              @id @default(cuid())
  version         String              // e.g., "E2-2026"
  effectiveDate   DateTime            // CMS effective date
  status          TemplateStatus      @default(DRAFT)

  sections        OasisSection[]
  companyId       String?
  company         Company?            @relation(fields: [companyId], references: [id])

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model OasisSection {
  id              String              @id @default(cuid())
  templateId      String
  template        OasisTemplate       @relation(fields: [templateId], references: [id], onDelete: Cascade)

  code            String              // e.g., "A", "GG"
  name            String              // e.g., "Administrative Information"
  order           Int

  items           OasisItem[]

  @@unique([templateId, code])
}

model OasisItem {
  id              String              @id @default(cuid())
  sectionId       String
  section         OasisSection        @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  code            String              // e.g., "M0030", "GG0130A"
  label           String
  description     String?
  helpText        String?             @db.Text // CMS guidance

  fieldType       FormFieldType
  config          Json                // Type-specific config
  required        Boolean             @default(false)
  order           Int

  // Time point visibility
  visibleAt       OasisTimePoint[]
  requiredAt      OasisTimePoint[]

  // Skip logic
  skipLogic       Json?               // SkipLogicRule[]

  // Scoring
  scoreMapping    Json?               // Value → Score mapping
  contributesToScore String?          // Target calculated field code

  @@unique([sectionId, code])
}

model OasisAssessment {
  id              String              @id @default(cuid())
  templateId      String
  template        OasisTemplate       @relation(fields: [templateId], references: [id])

  // Patient & Episode
  clientId        String
  client          Client              @relation(fields: [clientId], references: [id])
  episodeId       String?             // Link to care episode

  // Time point & dates
  timePoint       OasisTimePoint
  m0030SocDate    DateTime?
  m0032RocDate    DateTime?
  m0090AssessmentDate DateTime?
  m0906DischargeDate DateTime?

  // Linking
  priorAssessmentId String?
  priorAssessment OasisAssessment?    @relation("AssessmentChain", fields: [priorAssessmentId], references: [id])
  followingAssessments OasisAssessment[] @relation("AssessmentChain")

  // Assessor
  assessorId      String
  assessor        User                @relation(fields: [assessorId], references: [id])
  assessorDiscipline String?          // RN, PT, OT, ST

  // Status & workflow
  status          OasisStatus         @default(DRAFT)
  startedAt       DateTime            @default(now())
  completedAt     DateTime?

  // QA
  qaStatus        QAStatus?
  qaComment       String?
  qaReviewedAt    DateTime?
  qaReviewedById  String?

  // Submission
  submittedAt     DateTime?
  transmissionId  String?             // CMS batch ID

  // Data
  responses       OasisResponse[]
  scores          Json?               // Calculated scores

  companyId       String
  company         Company             @relation(fields: [companyId], references: [id])

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([clientId])
  @@index([companyId])
  @@index([timePoint])
}

model OasisResponse {
  id              String              @id @default(cuid())
  assessmentId    String
  assessment      OasisAssessment     @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  itemCode        String              // Reference to OasisItem.code

  // Polymorphic value storage
  valueText       String?
  valueNumber     Float?
  valueBoolean    Boolean?
  valueDate       DateTime?
  valueJson       Json?               // For complex types (matrix, multi-select)

  // Computed score for this response
  score           Float?

  // Audit
  skipped         Boolean             @default(false)
  skipReason      String?

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@unique([assessmentId, itemCode])
}
```

---

## 8. New Components Required

### 8.1 Field Components

| Component                   | Location                       | Purpose                  |
| --------------------------- | ------------------------------ | ------------------------ |
| `CodeEntryField`            | `src/components/oasis/fields/` | Single/multi-code input  |
| `MatrixGridField`           | `src/components/oasis/fields/` | Row/column grid selector |
| `DatePartsField`            | `src/components/oasis/fields/` | MM-DD-YYYY boxes         |
| `HierarchicalCheckboxField` | `src/components/oasis/fields/` | Nested checkboxes        |
| `CalculatedScoreField`      | `src/components/oasis/fields/` | Auto-computed totals     |
| `NumericCounterField`       | `src/components/oasis/fields/` | Count entry              |
| `StructuredIdField`         | `src/components/oasis/fields/` | Formatted IDs            |
| `MultiDiagnosisField`       | `src/components/oasis/fields/` | M1021/M1023 ICD-10 entry |

### 8.2 Builder Components

| Component               | Location                        | Purpose                 |
| ----------------------- | ------------------------------- | ----------------------- |
| `OasisTemplateBuilder`  | `src/components/oasis/builder/` | Main builder UI         |
| `OasisSectionEditor`    | `src/components/oasis/builder/` | Section configuration   |
| `OasisItemEditor`       | `src/components/oasis/builder/` | Item configuration      |
| `SkipLogicEditor`       | `src/components/oasis/builder/` | Visual skip logic       |
| `TimePointConfigurator` | `src/components/oasis/builder/` | Time point visibility   |
| `ScoringConfigurator`   | `src/components/oasis/builder/` | Score calculation setup |

### 8.3 Renderer Components

| Component                 | Location                         | Purpose                      |
| ------------------------- | -------------------------------- | ---------------------------- |
| `OasisAssessmentRenderer` | `src/components/oasis/renderer/` | Main assessment UI           |
| `OasisSectionRenderer`    | `src/components/oasis/renderer/` | Section display              |
| `OasisItemRenderer`       | `src/components/oasis/renderer/` | Item display with skip logic |
| `OasisProgressBar`        | `src/components/oasis/renderer/` | Section progress             |
| `OasisScorePanel`         | `src/components/oasis/renderer/` | Live scoring display         |
| `OasisNavigator`          | `src/components/oasis/renderer/` | Section navigation           |

### 8.4 Workflow Components

| Component                | Location                         | Purpose                    |
| ------------------------ | -------------------------------- | -------------------------- |
| `OasisWizard`            | `src/components/oasis/workflow/` | Assessment creation wizard |
| `OasisTimePointSelector` | `src/components/oasis/workflow/` | SOC/ROC/DC selector        |
| `OasisComparisonView`    | `src/components/oasis/workflow/` | SOC vs DC comparison       |
| `OasisQAReview`          | `src/components/oasis/workflow/` | QA review interface        |
| `OasisExportDialog`      | `src/components/oasis/workflow/` | Export options             |

### 8.5 Page Components

| Page                  | Location                               | Purpose                  |
| --------------------- | -------------------------------------- | ------------------------ |
| `OasisDashboard`      | `src/app/(dashboard)/oasis/`           | OASIS overview           |
| `NewOasisAssessment`  | `src/app/(dashboard)/oasis/new/`       | Start assessment         |
| `OasisAssessmentView` | `src/app/(dashboard)/oasis/[id]/`      | Complete/view assessment |
| `OasisTemplates`      | `src/app/(dashboard)/oasis/templates/` | Template management      |
| `OasisReports`        | `src/app/(dashboard)/oasis/reports/`   | Compliance reports       |

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Field component rendering
- Skip logic evaluation
- Score calculation
- Validation rules
- Time point filtering

### 9.2 Integration Tests

- Assessment creation flow
- Skip logic navigation
- Score updates on response change
- QA workflow transitions
- Export generation

### 9.3 CMS Compliance Tests

- All OASIS item codes present
- Skip patterns match CMS spec
- Scoring matches CMS formulas
- Time point item visibility correct
- Export format validation

### 9.4 User Acceptance Tests

- Complete SOC assessment end-to-end
- Complete DC assessment end-to-end
- QA review and approval
- Score accuracy verification
- Mobile/tablet usability

---

## 10. Compliance Considerations

### 10.1 HIPAA

- Assessment data encryption at rest
- Audit logging for all access
- Role-based access control
- Data retention policies

### 10.2 CMS Requirements

- OASIS-E2 effective date: April 1, 2026
- Transmission deadlines (5 days for SOC, etc.)
- Correction procedures (final vs. inactivation)
- Clinician qualification requirements

### 10.3 Quality Reporting

- OASIS data feeds quality measures
- Ensure data accuracy for:
  - Hospitalization rates
  - Improvement in mobility
  - Discharge to community
  - Falls with injury

---

## Appendix A: OASIS-E2 Section Reference

| Section                     | Code Range    | Items | Time Points      |
| --------------------------- | ------------- | ----- | ---------------- |
| A - Administrative          | M0010-A2124   | 40+   | All              |
| B - Hearing, Speech, Vision | B0200-B1300   | 4     | SOC, ROC, DC     |
| C - Cognitive Patterns      | C0100-M1720   | 12    | SOC, ROC, FU, DC |
| D - Mood                    | D0150-D0700   | 4     | SOC, ROC, FU, DC |
| E - Behavior                | M1740-M1745   | 2     | SOC, ROC, FU, DC |
| F - Preferences             | M1100-M2102   | 3     | SOC, ROC, DC     |
| G - Functional Status       | M1800-M1860   | 8     | SOC, ROC, DC     |
| GG - Functional Abilities   | GG0100-GG0170 | 30+   | SOC, ROC, FU, DC |
| H - Bladder & Bowel         | M1600-M1630   | 4     | SOC, ROC, DC     |
| I - Active Diagnoses        | M1021-M1028   | 3     | SOC, ROC, DC     |
| J - Health Conditions       | M1033-J1900   | 8     | SOC, ROC, DC     |
| K - Swallowing/Nutrition    | M1060-M1870   | 5     | SOC, ROC, DC     |
| M - Skin Conditions         | M1306-M1342   | 10    | SOC, ROC, DC     |
| N - Medications             | N0415-M2030   | 6     | SOC, ROC, DC     |
| O - Special Treatments      | O0110-M1046   | 4     | SOC, ROC, DC     |
| Q - Participation           | M2401         | 1     | DC               |

---

## Appendix B: Key Item Specifications

### BIMS Scoring (Section C)

| Item                 | Score Range |
| -------------------- | ----------- |
| C0200 (Repetition)   | 0-3         |
| C0300A (Year)        | 0-3         |
| C0300B (Month)       | 0-2         |
| C0300C (Day)         | 0-1         |
| C0400A (Recall sock) | 0-2         |
| C0400B (Recall blue) | 0-2         |
| C0400C (Recall bed)  | 0-2         |
| **C0500 (Total)**    | **0-15**    |

Interpretation:

- 13-15: Cognitively intact
- 8-12: Moderate impairment
- 0-7: Severe impairment
- 99: Unable to complete

### PHQ-9 Scoring (Section D)

| Item              | Frequency Score |
| ----------------- | --------------- |
| D0150A-I          | 0-3 each        |
| **D0160 (Total)** | **0-27**        |

Stop rules:

- If D0150A1 AND D0150B1 = 9 (No response), end PHQ-2
- If D0150A2 AND D0150B2 = 0 or 1, end PHQ-2

---

## Appendix C: File Structure Proposal

```
src/
├── app/
│   └── (dashboard)/
│       └── oasis/
│           ├── page.tsx                    # Dashboard
│           ├── new/
│           │   └── page.tsx                # New assessment wizard
│           ├── [id]/
│           │   ├── page.tsx                # Assessment completion
│           │   └── edit/
│           │       └── page.tsx            # Edit assessment
│           ├── templates/
│           │   ├── page.tsx                # Template list
│           │   ├── new/
│           │   │   └── page.tsx            # New template
│           │   └── [id]/
│           │       └── edit/
│           │           └── page.tsx        # Edit template
│           └── reports/
│               └── page.tsx                # Compliance reports
├── components/
│   └── oasis/
│       ├── fields/
│       │   ├── code-entry-field.tsx
│       │   ├── matrix-grid-field.tsx
│       │   ├── date-parts-field.tsx
│       │   ├── hierarchical-checkbox-field.tsx
│       │   ├── calculated-score-field.tsx
│       │   ├── numeric-counter-field.tsx
│       │   ├── structured-id-field.tsx
│       │   └── multi-diagnosis-field.tsx
│       ├── builder/
│       │   ├── oasis-template-builder.tsx
│       │   ├── oasis-section-editor.tsx
│       │   ├── oasis-item-editor.tsx
│       │   ├── skip-logic-editor.tsx
│       │   └── scoring-configurator.tsx
│       ├── renderer/
│       │   ├── oasis-assessment-renderer.tsx
│       │   ├── oasis-section-renderer.tsx
│       │   ├── oasis-item-renderer.tsx
│       │   ├── oasis-progress-bar.tsx
│       │   ├── oasis-score-panel.tsx
│       │   └── oasis-navigator.tsx
│       └── workflow/
│           ├── oasis-wizard.tsx
│           ├── oasis-time-point-selector.tsx
│           ├── oasis-comparison-view.tsx
│           ├── oasis-qa-review.tsx
│           └── oasis-export-dialog.tsx
├── lib/
│   └── oasis/
│       ├── types.ts                        # Type definitions
│       ├── validation.ts                   # Validation schemas
│       ├── skip-logic.ts                   # Skip logic evaluator
│       ├── scoring.ts                      # Score calculators
│       ├── constants.ts                    # OASIS codes & labels
│       └── export.ts                       # Export format generator
└── app/
    └── api/
        └── oasis/
            ├── templates/
            │   ├── route.ts
            │   └── [id]/
            │       └── route.ts
            └── assessments/
                ├── route.ts
                └── [id]/
                    ├── route.ts
                    ├── complete/
                    │   └── route.ts
                    └── export/
                        └── route.ts
```

---

_Document Version: 1.0_
_Last Updated: 2026-03-06_
_Author: Claude AI Assistant_
