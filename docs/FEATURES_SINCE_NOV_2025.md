# Features Implemented Since November 2025

This document lists all major features implemented in Carebase since November 2025, along with estimated development hours for a software engineer to implement each feature.

## Summary

| Category          | Features | Total Estimated Hours |
| ----------------- | -------- | --------------------- |
| Core Platform     | 5        | 280                   |
| Assessment System | 4        | 160                   |
| Care Plans        | 5        | 200                   |
| Visit Notes       | 6        | 180                   |
| Scheduling & EVV  | 6        | 200                   |
| Fax & PDF Export  | 4        | 80                    |
| Staff & HR        | 4        | 120                   |
| Billing & Payroll | 3        | 100                   |
| Client Management | 3        | 80                    |
| iOS Mobile App    | 1        | 200                   |
| **Total**         | **41**   | **~1,600 hours**      |

---

## Detailed Feature Breakdown

### 1. Core Platform Foundation

_Commits: ca8e8f6 - b316fd2 (January 2026)_

#### 1.1 Authentication & Authorization System

- User registration with company creation
- Login with NextAuth.js integration
- Role-based permissions system (Admin, Clinical Director, Supervisor, Caregiver, etc.)
- Password validation and security
- Session management

**Estimated Hours: 40**

#### 1.2 Dashboard & Navigation

- Multi-widget dashboard with collapsible sections
- Activity feed with real-time updates
- Credential alerts widget
- Upcoming shifts widget
- Check-in status widget
- Missing visit notes alerts
- Responsive sidebar navigation with role-based menu items

**Estimated Hours: 60**

#### 1.3 Notification System

- In-app notifications panel
- Notification bell with unread count
- Mark as read functionality
- Notification API endpoints

**Estimated Hours: 24**

#### 1.4 Settings & Configuration

- Company settings management
- Profile templates configuration
- State-specific settings
- User preferences

**Estimated Hours: 32**

#### 1.5 Reporting Infrastructure

- Visit notes reports with field selection
- Date range filtering
- Export functionality
- Dynamic report generation

**Estimated Hours: 40**

---

### 2. Assessment System

_Commits: 587b8ea - 8f0ea71, ee44fd3 (February 2026)_

#### 2.1 Assessment Template Builder

- Drag-and-drop section ordering
- Multiple question types (numeric scale, text, yes/no, single select, multi-select, date, time)
- Response options configuration with scoring
- Required field validation
- Template versioning

**Estimated Hours: 60**

#### 2.2 Assessment Renderer

- Dynamic form rendering based on template
- Section-by-section navigation
- Auto-save functionality
- Score calculation (total, percentage, care level)
- Completion workflow

**Estimated Hours: 40**

#### 2.3 Assessment Management

- Assessment list with filtering and search
- Assessment detail view
- Assessment status tracking (In Progress, Completed, Cancelled)
- QA workflow integration

**Estimated Hours: 32**

#### 2.4 Assessment PDF Export & Fax

- Server-side PDF generation using jsPDF
- Professional formatting with company branding
- Send via fax integration (Sinch)
- Fax status tracking

**Estimated Hours: 28**

---

### 3. Care Plan System

_Commits: ee44fd3, eb99f2d (February 2026)_

#### 3.1 Care Plan Template Builder

- Section-based template structure
- Field types: text, textarea, date, select, multi-select, checkbox, number, phone, signature
- Field validation rules (required, min/max length)
- Conditional field display
- Template preview

**Estimated Hours: 60**

#### 3.2 Care Plan Renderer

- Dynamic form rendering from template
- Section completion tracking with visual indicators
- Validation and error display
- Auto-save with debouncing

**Estimated Hours: 40**

#### 3.3 Care Plan Form

- Client information display
- Diagnosis management (ICD-10 codes)
- Orders management by discipline
- Physician selection with manual entry fallback
- Certification period tracking
- Signature workflow (nurse, client, physician)

**Estimated Hours: 48**

#### 3.4 Care Plan PDF Export & Fax

- Server-side PDF generation
- Professional clinical document formatting
- Physician certification section
- Fax to physician workflow
- Signature tracking dates

**Estimated Hours: 28**

#### 3.5 Care Plan Management

- Care plan list with status filtering
- Care plan detail view
- Status workflow (Draft, Pending Review, Active, Completed)
- Version history

**Estimated Hours: 24**

---

### 4. Visit Notes System

_Commits: ca8e8f6 - d1f264b, eb99f2d (January - February 2026)_

#### 4.1 Visit Note Template Builder

- Drag-and-drop form builder
- Field types: text, textarea, number, date, time, select, multi-select, checkbox, rating, file upload, signature, body map
- Section grouping with ordering
- Starter templates library

**Estimated Hours: 48**

#### 4.2 Visit Note Form Renderer

- Dynamic field rendering
- Body map with anatomical regions
- File upload with preview
- Signature capture
- Real-time validation

**Estimated Hours: 40**

#### 4.3 Visit Note Management

- Visit notes list with filtering
- Visit note detail view with edit capability
- Comment system with mentions (@user)
- Status tracking

**Estimated Hours: 32**

#### 4.4 Visit Note PDF Export

- Server-side PDF generation
- Body map visualization in PDF
- File attachments handling
- Professional formatting

**Estimated Hours: 24**

#### 4.5 Visit Note Fax Integration

- Send to physician fax
- Fax record tracking
- Status webhooks

**Estimated Hours: 20**

#### 4.6 Body Map Component

- SVG-based anatomical diagram
- Click/tap region selection
- Front and back views
- Annotation support

**Estimated Hours: 16**

---

### 5. Scheduling & EVV System

_Commits: f30f07d, 69e883c, df2f211 (January - February 2026)_

#### 5.1 Calendar Scheduling View

- Weekly/monthly calendar views
- Drag-and-drop shift creation
- Shift detail modal
- Caregiver and client assignment
- Recurring shift patterns

**Estimated Hours: 48**

#### 5.2 Bulk Scheduling

- Multiple shift creation
- Template-based scheduling
- Date range selection
- Conflict detection

**Estimated Hours: 24**

#### 5.3 Electronic Visit Verification (EVV)

- GPS-based check-in/check-out
- Time tracking with location validation
- EVV dashboard with compliance metrics
- EVV reports generation

**Estimated Hours: 40**

#### 5.4 Web Check-in Modal

- Browser-based check-in for caregivers
- Location capture
- Signature collection
- Parent/guardian signature option

**Estimated Hours: 20**

#### 5.5 Missed Visit Tracking

- Mark visit as missed workflow
- Reason selection (client not home, caregiver no-show, etc.)
- Documentation requirements
- Reporting integration

**Estimated Hours: 24**

#### 5.6 Authorization Unit Deduction

- Automatic unit deduction on shift completion
- Authorization balance tracking
- Unit type support (hours, visits, units)
- Alerts for low authorization

**Estimated Hours: 24**

---

### 6. Fax System

_Commits: 22f9484, visit-notes fax, care-plan fax, assessment fax (February 2026)_

#### 6.1 Outbound Fax Integration

- Sinch API integration
- E.164 phone number formatting
- PDF attachment support
- Fax header customization

**Estimated Hours: 24**

#### 6.2 Inbound Fax Receiving

- Webhook receiver for incoming faxes
- Fax document storage
- Assignment to users
- Processing workflow

**Estimated Hours: 24**

#### 6.3 Fax Settings Management

- Fax number configuration
- Webhook URL setup
- Status monitoring

**Estimated Hours: 8**

#### 6.4 Fax Record Tracking

- Fax history with status
- Error handling and retry
- Audit logging

**Estimated Hours: 16**

---

### 7. Staff & HR Management

_Commits: eb99f2d supervision, training, competencies (February 2026)_

#### 7.1 Staff Profile Management

- Comprehensive staff profiles
- Credential tracking
- Employment history
- Contact information

**Estimated Hours: 32**

#### 7.2 Supervision Module

- Supervision relationships
- Supervision visit scheduling
- Visit documentation with signatures
- Compliance tracking

**Estimated Hours: 32**

#### 7.3 Training Management

- Training course creation
- Training sessions scheduling
- Attendance tracking
- Certificate generation

**Estimated Hours: 32**

#### 7.4 Competency Tracking

- Competency type definitions
- Staff competency assessments
- Remediation plans
- Verification workflow

**Estimated Hours: 24**

---

### 8. Billing & Payroll

_Commits: 2266b65, eb99f2d billing (February 2026)_

#### 8.1 Billing Dashboard

- Billing periods management
- Service rates configuration
- Invoice generation

**Estimated Hours: 40**

#### 8.2 Invoice Management

- Invoice creation and editing
- Payment tracking
- Invoice PDF generation
- Batch processing

**Estimated Hours: 36**

#### 8.3 Payroll Processing

- Pay period management
- Hours calculation from shifts
- Rate application
- Export functionality

**Estimated Hours: 24**

---

### 9. Client Management

_Commits: eb99f2d unified client, ee44fd3 (February 2026)_

#### 9.1 Unified Client Form

- Multi-step client intake
- Basic info, referral source, care needs
- Full profile with physician info
- Form validation

**Estimated Hours: 32**

#### 9.2 Client Search & Selection

- Searchable client dropdown
- Client profile quick view
- Recent clients list

**Estimated Hours: 16**

#### 9.3 Client Profile

- Comprehensive client view
- Care plans listing
- Assessments history
- Visit notes history
- Authorizations

**Estimated Hours: 32**

---

### 10. Sponsors Module

_Commits: 3aed766, 5990d06 (February 2026)_

#### 10.1 Sponsor Management

- Sponsor creation and editing
- Sponsor search select component
- Sponsor-client relationships

**Estimated Hours: 24**

---

### 11. Intake & Referrals

_Commits: 25f74b6, referrals (February 2026)_

#### 11.1 Intake Workflow

- Intake form with status tracking
- Assessment integration
- Care plan generation
- Kanban board view

**Estimated Hours: 32**

#### 11.2 Referral Management

- Referral tracking
- Source attribution
- Status workflow

**Estimated Hours: 16**

---

### 12. Incidents & QA

_Commits: eb99f2d incidents, qa (February 2026)_

#### 12.1 Incident Reporting

- Incident form with categorization
- Investigation workflow
- Documentation requirements

**Estimated Hours: 24**

#### 12.2 QA Dashboard

- QA review queue
- Approval workflow
- Notes and feedback

**Estimated Hours: 20**

---

### 13. iOS Mobile Application

_Commit: ca8e8f6 (January 2026)_

#### 13.1 iOS App Foundation

- SwiftUI architecture
- Design system tokens (colors, typography, spacing)
- Reusable components (buttons, cards, text fields, badges)
- Animations library

**Estimated Hours: 40**

#### 13.2 Authentication

- Login screen with form validation
- Token management
- Session persistence

**Estimated Hours: 16**

#### 13.3 Dashboard & Navigation

- Tab-based navigation
- Dashboard with stats widgets
- Upcoming shifts display

**Estimated Hours: 24**

#### 13.4 Shifts Management

- Shifts list view
- Shift detail view
- Check-in/check-out functionality
- GPS location capture

**Estimated Hours: 32**

#### 13.5 Visit Notes

- Template selection modal
- Dynamic form rendering
- Photo capture
- Signature collection
- Offline support

**Estimated Hours: 48**

#### 13.6 Clients List

- Searchable client list
- Client detail view
- Quick actions

**Estimated Hours: 16**

#### 13.7 Notifications

- Push notification handling
- In-app notification list
- Badge count management

**Estimated Hours: 16**

#### 13.8 Profile

- User profile view
- Settings management
- Logout functionality

**Estimated Hours: 8**

---

### 14. Infrastructure & DevOps

_Various commits_

#### 14.1 Testing Infrastructure

- Jest configuration
- Playwright E2E setup
- Unit tests for utilities
- Component tests
- API test utilities

**Estimated Hours: 24**

#### 14.2 Database Migrations

- Prisma schema updates
- Seed scripts
- Migration scripts

**Estimated Hours: 16**

#### 14.3 Documentation

- Joint Commission compliance plan
- User guides (Carer, Sponsor)
- Module documentation
- Testing strategy

**Estimated Hours: 16**

---

## Notes on Estimates

1. **Hours are estimates for a mid-level software engineer** with familiarity in the tech stack (Next.js, React, TypeScript, Prisma, TailwindCSS, SwiftUI).

2. **Estimates include:**
   - Code implementation
   - Basic testing
   - Code review iterations
   - Bug fixes

3. **Estimates exclude:**
   - Project management
   - Design/UX work
   - DevOps/deployment
   - Comprehensive testing/QA
   - Documentation writing

4. **Actual development time may vary** based on:
   - Developer experience
   - Code quality requirements
   - Testing depth
   - Integration complexity

---

_Generated: February 2026_
_Total Commits Analyzed: 52_
_Date Range: January 15, 2026 - February 20, 2026_
