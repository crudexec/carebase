# eMAR Implementation Phases

## Overview

This document tracks the implementation phases for the Electronic Medication Administration Record (eMAR) module in CareBase.

---

## Phase 1: Edit Medication + Narcotic Counts ✅ COMPLETED

### Edit Medication Page

- [x] Created `/emar/medications/[id]/edit` page
- [x] Reuses `MedicationForm` component in edit mode

### Narcotic Count Management

- [x] API Routes:
  - `GET/POST /api/narcotic-counts` - List and create counts
  - `GET /api/narcotic-counts/[id]` - Get single count
  - `POST /api/narcotic-counts/[id]/verify` - Two-person verification
  - `POST /api/narcotic-counts/[id]/resolve` - Resolve discrepancies
  - `GET/POST /api/narcotic-inventory` - Manage controlled substance inventory

- [x] Pages:
  - `/emar/narcotics` - Main dashboard with inventory list, recent counts
  - `/emar/narcotics/verify/[id]` - Verification page
  - `/emar/narcotics/resolve/[id]` - Discrepancy resolution page
  - `/emar/narcotics/history` - Full count history with filters

- [x] Components:
  - `NarcoticCountModal` - Record new counts
  - `AddInventoryModal` - Add controlled substance inventory

### Features

- Shift-based counting (Day/Evening/Night)
- Two-person verification (cannot verify own count)
- Discrepancy detection and resolution workflow
- Audit logging for all count actions
- Low inventory alerts

---

## Phase 2: Refill Management ✅ COMPLETED (with known issues)

### API Routes

- [x] `GET/POST /api/refills` - List and create refill requests
- [x] `GET/PUT /api/refills/[id]` - Get and update refill requests

### Pages

- [x] `/emar/refills` - Refill requests dashboard
- [x] `/emar/refills/[id]` - Refill detail/update page

### Components

- [x] `RefillRequestModal` - Create new refill requests

### Features

- Status workflow: PENDING → APPROVED/DENIED → ORDERED → RECEIVED
- Pharmacy information tracking
- Expected delivery date tracking
- Quantity received tracking
- Integration with medication detail page ("Request Refill" button)
- Dashboard alerts for pending refills

### Known Issues to Fix

- [ ] Refills list page not displaying existing refills (debug logging added)
- [ ] Need to verify companyId filtering is working correctly

---

## Phase 3: Reporting & Analytics 🔲 NOT STARTED

### MAR Reports

- [ ] Daily MAR report generation
- [ ] Weekly/Monthly summary reports
- [ ] Export to PDF/Excel
- [ ] Print-friendly MAR sheets

### Analytics Dashboard

- [ ] Medication administration compliance rates
- [ ] Missed dose tracking and trends
- [ ] PRN medication usage analysis
- [ ] Controlled substance usage reports

### Audit Reports

- [ ] Administration audit trail
- [ ] Narcotic count audit reports
- [ ] User activity reports
- [ ] Discrepancy history reports

### Implementation Notes

```
Pages to create:
- /emar/reports - Reports dashboard
- /emar/reports/mar - MAR report generator
- /emar/reports/compliance - Compliance analytics
- /emar/reports/controlled - Controlled substance reports

API routes:
- GET /api/emar/reports/mar - Generate MAR report data
- GET /api/emar/reports/compliance - Compliance statistics
- GET /api/emar/reports/controlled - Controlled substance summary
```

---

## Phase 4: Enhancements 🔲 NOT STARTED

### Barcode Scanning

- [ ] Medication barcode scanning for verification
- [ ] Client wristband scanning
- [ ] Integration with device camera

### Mobile Optimization

- [ ] Offline support for med pass
- [ ] Push notifications for due medications
- [ ] Quick-action widgets

### Integration Features

- [ ] Pharmacy integration (e-prescribing)
- [ ] Lab results integration (hold medications based on labs)
- [ ] Allergy checking against formulary
- [ ] Drug interaction warnings (real-time)

### Advanced Features

- [ ] Medication reconciliation workflow
- [ ] Transition of care documentation
- [ ] Family/caregiver medication portal
- [ ] Automated refill reminders

### Performance & UX

- [ ] Bulk medication administration
- [ ] Medication templates for common regimens
- [ ] Voice notes for administration records
- [ ] Photo documentation for topical medications

---

## Technical Debt & Improvements

### Code Quality

- [ ] Add comprehensive test coverage for eMAR APIs
- [ ] Add E2E tests for critical workflows (med pass, narcotic counts)
- [ ] Refactor validation schemas to share common patterns

### Performance

- [ ] Add caching for medication lists
- [ ] Optimize med-pass queries with proper indexing
- [ ] Implement pagination for large medication lists

### Security

- [ ] Add rate limiting to sensitive endpoints
- [ ] Implement audit log retention policies
- [ ] Add two-factor authentication for controlled substance actions

---

## Database Schema Notes

### Key Models

- `Medication` - Core medication record
- `ScheduledDose` - Individual dose instances
- `MedicationAdministration` - Administration records
- `MedicationInventory` - Controlled substance inventory
- `NarcoticCountRecord` - Shift count records
- `RefillRequest` - Refill tracking

### Enums

- `MedicationStatus`: ACTIVE, ON_HOLD, DISCONTINUED, COMPLETED
- `MedicationFrequency`: DAILY, BID, TID, QID, PRN, etc.
- `AdministrationResult`: GIVEN, REFUSED, HELD, NOT_AVAILABLE, etc.
- `ControlledSubstanceSchedule`: NOT_CONTROLLED, SCHEDULE_II through SCHEDULE_V
- `RefillRequestStatus`: PENDING, APPROVED, DENIED, ORDERED, RECEIVED, CANCELLED
- `NarcoticCountStatus`: PENDING, VERIFIED, DISCREPANCY

---

## Quick Reference

### File Locations

```
Pages:
  src/app/(dashboard)/emar/
    ├── page.tsx                    # Dashboard
    ├── medications/
    │   ├── page.tsx               # List
    │   ├── new/page.tsx           # Create
    │   └── [id]/
    │       ├── page.tsx           # Detail
    │       └── edit/page.tsx      # Edit
    ├── med-pass/
    │   └── page.tsx               # Med pass view
    ├── narcotics/
    │   ├── page.tsx               # Narcotic counts
    │   ├── history/page.tsx       # History
    │   ├── verify/[id]/page.tsx   # Verify
    │   └── resolve/[id]/page.tsx  # Resolve
    └── refills/
        ├── page.tsx               # List
        └── [id]/page.tsx          # Detail

Components:
  src/components/emar/
    ├── medications/
    │   ├── medication-form.tsx
    │   ├── medication-list.tsx
    │   └── medication-search.tsx
    ├── med-pass/
    │   ├── med-pass-view.tsx
    │   └── med-pass-card.tsx
    ├── narcotics/
    │   ├── narcotic-count-modal.tsx
    │   └── add-inventory-modal.tsx
    └── refills/
        └── refill-request-modal.tsx

API Routes:
  src/app/api/
    ├── medications/
    ├── med-pass/
    ├── administrations/
    ├── narcotic-counts/
    ├── narcotic-inventory/
    └── refills/
```

---

_Last Updated: February 2026_
