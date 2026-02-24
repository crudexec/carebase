# SynkWise Feature Analysis for CareBase Integration

**Analysis Date:** February 23, 2026
**Purpose:** Identify SynkWise features to add to CareBase
**Target Market:** Adult Family Homes, Assisted Living Facilities, Residential Care

---

## Executive Summary

This document analyzes SynkWise's feature set and compares it with CareBase's current capabilities to identify modules that should be added. CareBase is already a robust platform with ~1,600 hours of development, but lacks several residential care-specific features that SynkWise offers.

### Key Findings

| Category                     | CareBase Status          | SynkWise Has         | Priority     |
| ---------------------------- | ------------------------ | -------------------- | ------------ |
| eMAR (Medication Management) | **NOT IMPLEMENTED**      | Yes                  | **CRITICAL** |
| Pharmacy Integration         | **NOT IMPLEMENTED**      | Yes                  | **HIGH**     |
| Vital Signs Tracking         | Partial (in assessments) | Yes (30+ parameters) | **HIGH**     |
| Facility Management          | **NOT IMPLEMENTED**      | Yes                  | **MEDIUM**   |
| Time Clock/Timesheets        | Partial (via EVV)        | Yes                  | **MEDIUM**   |
| Narcotic Count Tracking      | **NOT IMPLEMENTED**      | Yes                  | **HIGH**     |
| Evacuation Drill Management  | **NOT IMPLEMENTED**      | Yes                  | **LOW**      |
| Inspection Management        | **NOT IMPLEMENTED**      | Yes                  | **MEDIUM**   |
| HIPAA Email                  | **NOT IMPLEMENTED**      | Yes                  | **MEDIUM**   |
| SMS Alerts                   | Partial                  | Yes                  | **LOW**      |

---

## Module Analysis

---

## 1. eMAR (Electronic Medication Administration Record)

### Status: **NOT IMPLEMENTED - CRITICAL PRIORITY**

### What SynkWise Offers

- Med pass administration with time-based scheduling
- Medication tracking and logging
- Pharmacy integration for order syncing
- Intelligent alerts (missed doses, interactions, allergies)
- Refill request management
- Physician order uploads
- PRN (as-needed) medication tracking
- Controlled substance documentation
- Medication error reduction features

### Why It's Critical

eMAR is the #1 feature for residential care facilities. It:

- Reduces medication errors (legally required in many states)
- Provides audit trail for compliance
- Integrates with pharmacies for efficiency
- Required by state licensing in most jurisdictions

### Implementation Plan

#### Phase 1: Core eMAR Infrastructure (Estimated: 120-160 hours)

**1.1 Database Models**

```
Medication
├── id, clientId, companyId
├── name, genericName, brandName
├── ndc (National Drug Code)
├── strength, form (tablet, liquid, injection, etc.)
├── route (oral, topical, injection, etc.)
├── prescriberId (Physician)
├── pharmacyId
├── instructions, specialInstructions
├── startDate, endDate
├── isControlled, deaSchedule (I-V)
├── status (active, discontinued, hold)
├── createdAt, updatedAt

MedicationSchedule
├── id, medicationId
├── scheduleType (scheduled, PRN, sliding scale)
├── times[] (array of scheduled times)
├── frequency (daily, BID, TID, QID, weekly, etc.)
├── daysOfWeek[] (for weekly meds)
├── windowBefore, windowAfter (administration window)
├── quantity, unit

MedicationAdministration (MAR Record)
├── id, medicationScheduleId, clientId
├── scheduledTime, administeredTime
├── status (given, held, refused, not available, late)
├── administeredById (caregiver)
├── witnessedById (for controlled substances)
├── notes, refusalReason, holdReason
├── vitalSigns (BP, pulse before/after - for certain meds)
├── signature, witnessSignature
├── createdAt

MedicationAlert
├── id, medicationId, clientId
├── alertType (interaction, allergy, missed, refill, expiration)
├── severity (low, medium, high, critical)
├── message, resolvedAt, resolvedById

MedicationAllergy
├── id, clientId
├── allergen, reaction, severity
├── documentedById, verifiedById

MedicationRefill
├── id, medicationId
├── requestedAt, requestedById
├── pharmacyId, status (pending, ordered, received)
├── quantityRequested, quantityReceived
├── receivedAt, receivedById

NarcoticCount
├── id, medicationId, date, shift
├── startCount, endCount
├── administered, wasted, received
├── countedById, witnessedById
├── discrepancy, discrepancyResolution
├── signatures[]
```

**1.2 API Endpoints**

```
/api/medications
  GET    - List medications (by client, facility)
  POST   - Create medication

/api/medications/[id]
  GET    - Get medication details
  PUT    - Update medication
  DELETE - Discontinue medication

/api/medications/[id]/schedule
  GET    - Get medication schedule
  PUT    - Update schedule

/api/mar
  GET    - Get MAR for date range (Med Pass View)

/api/mar/administer
  POST   - Record medication administration

/api/mar/batch
  POST   - Batch administration (for scheduled times)

/api/narcotic-counts
  GET    - Get narcotic count records
  POST   - Create shift count

/api/medications/alerts
  GET    - Get active alerts
  POST   - Create alert
  PUT    - Resolve alert

/api/medications/refills
  GET    - Get refill requests
  POST   - Request refill
  PUT    - Update refill status
```

**1.3 UI Components**

```
components/emar/
├── MedicationList.tsx          - List all client medications
├── MedicationForm.tsx          - Add/edit medication
├── MedicationCard.tsx          - Medication summary card
├── MedPassView.tsx             - Time-based medication pass UI
├── MARGrid.tsx                 - Calendar grid view of MAR
├── AdministrationModal.tsx     - Record administration
├── NarcoticCountForm.tsx       - Shift narcotic count
├── RefillRequestModal.tsx      - Request refill
├── MedicationAlerts.tsx        - Alert banner/list
├── DrugInteractionWarning.tsx  - Interaction alerts
├── AllergyBadge.tsx            - Allergy indicators
├── PRNLog.tsx                  - PRN medication history
├── MedicationReport.tsx        - Reports & exports
```

**1.4 Key Features to Implement**

1. **Med Pass Interface** - Time-based view showing all meds due
2. **Quick Administration** - One-click to mark as given
3. **Refusal/Hold Documentation** - Required reason capture
4. **Controlled Substance Workflow** - Witness signature required
5. **Narcotic Count** - Shift-based counting with dual signature
6. **Missed Dose Alerts** - Real-time notifications
7. **Drug Interaction Checking** - Integration with drug database
8. **Allergy Alerts** - Prominent warnings
9. **PRN Effectiveness** - Track effectiveness of PRN meds
10. **MAR Reports** - Daily, weekly, monthly reports

#### Phase 2: Pharmacy Integration (Estimated: 80-100 hours)

**2.1 Database Models**

```
Pharmacy
├── id, companyId
├── name, address, phone, fax, email
├── npi, ncpdpId
├── integrationEnabled, integrationProvider
├── apiCredentials (encrypted)
├── status (active, inactive)

PharmacyOrder
├── id, pharmacyId, clientId
├── medications[] (array of medication orders)
├── status (draft, submitted, processing, shipped, delivered)
├── orderNumber, trackingNumber
├── submittedAt, expectedDelivery, deliveredAt
├── notes

MedicationOrder
├── id, pharmacyOrderId, medicationId
├── quantity, refillsRemaining
├── status, notes
```

**2.2 Integration Options**

- **Surescripts** (industry standard for e-prescribing)
- **RxHub** (medication history)
- **Direct pharmacy APIs** (CostlessRX, Mercury, Genoa)
- **Manual fax-based ordering** (fallback)

**2.3 Workflows**

1. Automatic refill request when supply low
2. Electronic order submission to pharmacy
3. Order status tracking
4. Delivery confirmation
5. Medication reconciliation on delivery

#### Phase 3: Advanced Features (Estimated: 60-80 hours)

1. **Drug Database Integration**
   - NDC lookup (FDA drug database)
   - Drug-drug interaction checking
   - Drug-allergy cross-referencing
   - Dosage validation

2. **Mobile eMAR**
   - iOS app integration
   - Barcode scanning (medication verification)
   - Offline capability with sync

3. **Physician Orders**
   - Fax integration for orders
   - Electronic signature for order verification
   - Order expiration tracking

4. **Reports & Analytics**
   - Medication error reports
   - Administration compliance rates
   - Narcotic usage reports
   - Cost reports

---

## 2. Vital Signs Tracking Module

### Status: **PARTIAL - HIGH PRIORITY**

### Current CareBase State

- Vital signs can be captured in assessments and visit notes
- No dedicated vital signs tracking module
- No trending or alerting based on vitals

### What SynkWise Offers

- 30+ vital parameters
- Real-time monitoring
- Automated alerts for abnormal readings
- Trending and graphs
- Integration with health monitoring devices

### Implementation Plan (Estimated: 60-80 hours)

**3.1 Database Models**

```
VitalSign
├── id, clientId, companyId
├── recordedAt, recordedById
├── type (see types below)
├── value, unit
├── notes, isAbnormal
├── alertTriggered, alertId
├── source (manual, device)

VitalSignType (enum/config)
├── BLOOD_PRESSURE_SYSTOLIC
├── BLOOD_PRESSURE_DIASTOLIC
├── HEART_RATE
├── RESPIRATORY_RATE
├── TEMPERATURE
├── OXYGEN_SATURATION
├── WEIGHT
├── HEIGHT
├── BLOOD_GLUCOSE
├── PAIN_LEVEL
├── [20+ more parameters]

VitalSignBaseline
├── id, clientId, vitalSignType
├── normalRangeLow, normalRangeHigh
├── alertThresholdLow, alertThresholdHigh
├── customized (boolean)

VitalSignAlert
├── id, vitalSignId, clientId
├── type (high, low, critical)
├── message, acknowledgedAt, acknowledgedById
```

**3.2 UI Components**

```
components/vitals/
├── VitalSignsForm.tsx          - Record vitals
├── VitalSignsQuickEntry.tsx    - Quick entry for common vitals
├── VitalSignsChart.tsx         - Trending graphs
├── VitalSignsTable.tsx         - Tabular history
├── VitalSignsAlerts.tsx        - Alert management
├── BaselineSettings.tsx        - Per-client baselines
├── VitalSignsDashboard.tsx     - Overview widget
```

**3.3 Features**

1. Quick entry for common vital sets (BP, HR, RR, Temp, O2)
2. Graphical trending over time
3. Abnormal value highlighting
4. Automatic alerting based on thresholds
5. Integration with visit notes
6. Pre-medication vital requirement
7. Weight tracking with change alerts
8. Blood glucose logging for diabetics

---

## 3. Facility Management Module

### Status: **NOT IMPLEMENTED - MEDIUM PRIORITY**

CareBase is designed for home care agencies, while SynkWise is for residential facilities. This module adds facility-specific features.

### What SynkWise Offers

- Facility profile management
- Resident capacity tracking
- Room/bed assignment
- Document organization
- Inspection tracking
- Evacuation drill logging
- License/certification management

### Implementation Plan (Estimated: 80-100 hours)

**4.1 Database Models**

```
Facility
├── id, companyId
├── name, address, phone, email
├── licenseNumber, licenseExpiration
├── capacity, currentOccupancy
├── type (AFH, ALF, SNF, etc.)
├── administrator, emergencyContact
├── status (active, inactive)

FacilityRoom
├── id, facilityId
├── roomNumber, floor, wing
├── type (private, semi-private, shared)
├── capacity, currentOccupancy
├── amenities[], status

FacilityBed
├── id, roomId
├── bedNumber, status (available, occupied, reserved, maintenance)
├── clientId (current occupant)
├── admissionDate

FacilityInspection
├── id, facilityId
├── type (state, fire, health, internal)
├── inspectorName, agency
├── inspectionDate, result (passed, failed, conditional)
├── findings[], correctiveActions[]
├── followUpDate, documents[]

EvacuationDrill
├── id, facilityId
├── drillDate, drillType (fire, earthquake, tornado, etc.)
├── duration, participantCount
├── issues[], notes
├── conductedById
├── nextDrillDue

FacilityDocument
├── id, facilityId
├── documentType (license, policy, inspection, etc.)
├── name, fileUrl
├── expirationDate, renewalAlert
├── uploadedById, uploadedAt
```

**4.2 UI Components**

```
components/facility/
├── FacilityProfile.tsx         - Facility details
├── RoomManagement.tsx          - Room/bed management
├── OccupancyDashboard.tsx      - Capacity tracking
├── InspectionTracker.tsx       - Inspection management
├── EvacuationDrillLog.tsx      - Drill documentation
├── FacilityDocuments.tsx       - Document library
├── LicenseTracker.tsx          - License/cert tracking
├── FacilityReports.tsx         - Occupancy, inspection reports
```

---

## 4. Enhanced Time Clock / Timesheet Module

### Status: **PARTIAL - MEDIUM PRIORITY**

### Current CareBase State

- EVV system with GPS check-in/check-out
- Payroll module calculates hours from shifts
- No dedicated time clock interface

### What SynkWise Offers

- Staff time clock (punch in/out)
- Timesheet management
- Audit trails
- Overtime tracking
- Break tracking
- Approval workflow

### Implementation Plan (Estimated: 40-60 hours)

**5.1 Database Models**

```
TimeClockEntry
├── id, userId, companyId, facilityId
├── clockInTime, clockOutTime
├── clockInLocation, clockOutLocation
├── breakMinutes, breakNotes
├── totalHours, overtimeHours
├── status (active, completed, edited)
├── editedById, editReason
├── approvedById, approvedAt

TimesheetPeriod
├── id, userId, companyId
├── periodStart, periodEnd
├── totalRegularHours, totalOvertimeHours
├── status (draft, submitted, approved, rejected)
├── submittedAt, approvedAt, approvedById
├── notes
```

**5.2 Features**

1. Punch in/out interface (web + mobile)
2. Break tracking
3. Edit with audit trail
4. Timesheet summaries
5. Manager approval workflow
6. Overtime alerts
7. Export for payroll

---

## 5. HIPAA-Compliant Email Module

### Status: **NOT IMPLEMENTED - MEDIUM PRIORITY**

### Current CareBase State

- Uses Resend for transactional emails
- No secure messaging for PHI

### What SynkWise Offers

- HIPAA-compliant email
- Secure document sharing
- Audit logging

### Implementation Plan (Estimated: 40-60 hours)

**Options:**

1. **Paubox Integration** - HIPAA email API
2. **Virtru Integration** - Email encryption
3. **Custom Portal** - Secure message portal (no actual email)

**Recommended: Secure Message Portal + Notification Email**

- Send notification emails (non-PHI)
- Recipients click link to secure portal
- View message in authenticated session
- Full audit trail

---

## 6. Additional SynkWise Features to Consider

### 6.1 Incident/Behavior Tracking Enhancement

**Status:** Partial - CareBase has incidents, but could add:

- Behavior pattern tracking
- ABC (Antecedent-Behavior-Consequence) charting
- Behavior intervention plans
- Trend analysis

### 6.2 Family Portal Enhancement

**Status:** Partial (Sponsor role exists)
Add:

- Photo sharing
- Activity calendars
- Meal tracking visibility
- Video call scheduling

### 6.3 ADL (Activities of Daily Living) Tracking

**Status:** Partial (in visit notes)
Add:

- Dedicated ADL tracking interface
- Quick entry for daily ADLs
- Trending and reports
- Care aide mobile view

---

## Implementation Roadmap

### Phase 1: eMAR Core (Q2 2026)

**Duration:** 8-10 weeks
**Priority:** CRITICAL

| Week | Deliverable                                      |
| ---- | ------------------------------------------------ |
| 1-2  | Database models, API structure                   |
| 3-4  | Medication list, forms, basic CRUD               |
| 5-6  | Med Pass interface, administration recording     |
| 7-8  | Narcotic counting, controlled substance workflow |
| 9-10 | Alerts, reports, testing                         |

### Phase 2: Vital Signs + Facility (Q2-Q3 2026)

**Duration:** 6-8 weeks
**Priority:** HIGH

| Week | Deliverable                                    |
| ---- | ---------------------------------------------- |
| 1-2  | Vital signs database, basic UI                 |
| 3-4  | Trending, alerts, integration with visit notes |
| 5-6  | Facility management core                       |
| 7-8  | Room/bed management, documents                 |

### Phase 3: Pharmacy Integration (Q3 2026)

**Duration:** 4-6 weeks
**Priority:** HIGH

| Week | Deliverable                             |
| ---- | --------------------------------------- |
| 1-2  | Pharmacy model, manual ordering         |
| 3-4  | Electronic integration (1-2 pharmacies) |
| 5-6  | Refill automation, reconciliation       |

### Phase 4: Supporting Features (Q4 2026)

**Duration:** 4-6 weeks
**Priority:** MEDIUM

| Week | Deliverable             |
| ---- | ----------------------- |
| 1-2  | Time clock enhancement  |
| 3-4  | Secure messaging/email  |
| 5-6  | Mobile eMAR integration |

---

## Resource Requirements

### Development Team

- **Backend Developer:** 1-2 (Prisma, API routes, integrations)
- **Frontend Developer:** 1-2 (React, UI components)
- **Mobile Developer:** 1 (iOS eMAR, vitals)
- **QA Engineer:** 1 (Testing, compliance verification)

### External Resources

- **Drug Database API** - ~$200-500/month (First Databank, Medispan)
- **Pharmacy Integration** - Varies by pharmacy
- **HIPAA Email Service** - ~$10-20/user/month (Paubox)

### Estimated Total Development Hours

| Module               | Hours             |
| -------------------- | ----------------- |
| eMAR Core            | 120-160           |
| Pharmacy Integration | 80-100            |
| eMAR Advanced        | 60-80             |
| Vital Signs          | 60-80             |
| Facility Management  | 80-100            |
| Time Clock           | 40-60             |
| HIPAA Email          | 40-60             |
| Mobile Integration   | 60-80             |
| Testing & QA         | 80-100            |
| **TOTAL**            | **620-820 hours** |

---

## Feature Comparison Matrix

| Feature                    | SynkWise | CareBase Current | CareBase After |
| -------------------------- | -------- | ---------------- | -------------- |
| **Medication Management**  |
| eMAR                       | Yes      | No               | Yes            |
| Med Pass View              | Yes      | No               | Yes            |
| Narcotic Counts            | Yes      | No               | Yes            |
| Pharmacy Integration       | Yes      | No               | Yes            |
| Drug Interaction Alerts    | Yes      | No               | Yes            |
| PRN Tracking               | Yes      | No               | Yes            |
| **Clinical**               |
| Assessments                | Yes      | Yes              | Yes            |
| Care Plans                 | Yes      | Yes              | Yes            |
| Visit Notes/Progress Notes | Yes      | Yes              | Yes            |
| Vital Signs (30+ params)   | Yes      | Partial          | Yes            |
| Body Map                   | Unknown  | Yes              | Yes            |
| **Operations**             |
| Scheduling                 | Yes      | Yes              | Yes            |
| EVV/GPS                    | Unknown  | Yes              | Yes            |
| Time Clock                 | Yes      | Partial          | Yes            |
| Payroll                    | Basic    | Yes              | Yes            |
| Invoicing                  | Unknown  | Yes              | Yes            |
| **Facility**               |
| Facility Management        | Yes      | No               | Yes            |
| Room/Bed Management        | Yes      | No               | Yes            |
| Inspection Tracking        | Yes      | No               | Yes            |
| Evacuation Drills          | Yes      | No               | Yes            |
| **Staff**                  |
| Staff Management           | Yes      | Yes              | Yes            |
| Credentials                | Yes      | Yes              | Yes            |
| Training                   | Unknown  | Yes              | Yes            |
| Competencies               | Unknown  | Yes              | Yes            |
| Supervision                | Unknown  | Yes              | Yes            |
| **Communication**          |
| HIPAA Email                | Yes      | No               | Yes            |
| In-App Messaging           | Unknown  | Yes              | Yes            |
| SMS Alerts                 | Yes      | Partial          | Yes            |
| Fax                        | Yes      | Yes              | Yes            |
| **Documents**              |
| Form Builder               | Yes      | Yes              | Yes            |
| Digital Signatures         | Yes      | Yes              | Yes            |
| PDF Export                 | Yes      | Yes              | Yes            |
| **Compliance**             |
| HIPAA                      | Yes      | Yes              | Yes            |
| State Compliance           | Yes      | Yes              | Yes            |
| Audit Logs                 | Yes      | Yes              | Yes            |
| **Mobile**                 |
| Mobile App                 | Yes      | Yes (iOS)        | Yes            |
| Offline Mode               | Unknown  | Partial          | Yes            |

---

## Conclusion

CareBase is a comprehensive platform that already exceeds SynkWise in several areas (EVV, supervision, training, competencies, intake pipeline, QA workflows). However, to compete in the **residential care market** (AFH, ALF), the following are **must-have additions**:

1. **eMAR** - Critical for regulatory compliance and is expected by all residential facilities
2. **Pharmacy Integration** - Differentiator for operational efficiency
3. **Vital Signs Module** - Expected feature for health monitoring
4. **Facility Management** - Required for multi-facility operations

The estimated **620-820 hours** of development would position CareBase as a comprehensive solution serving both **home care agencies** (current strength) AND **residential facilities** (new market).

---

## Next Steps

1. **Prioritize eMAR** - Begin database schema and API design
2. **Research Pharmacy APIs** - Evaluate Surescripts, direct pharmacy integrations
3. **Drug Database Selection** - First Databank vs. Medispan vs. open-source (RxNorm)
4. **Mobile Planning** - Define iOS eMAR requirements
5. **Compliance Review** - Ensure eMAR meets state regulations

---

_Document prepared for CareBase development team_
