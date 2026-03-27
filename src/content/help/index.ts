import { UserRole } from "@prisma/client";

export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  roles?: UserRole[];
  keywords: string[];
  order: number;
  popular?: boolean;
}

export interface HelpCategory {
  slug: string;
  title: string;
  icon: string;
  description: string;
  order: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// Categories
export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    icon: "Rocket",
    description: "Learn the basics of using CareBase",
    order: 1,
  },
  {
    slug: "clients",
    title: "Client Management",
    icon: "Users",
    description: "Managing clients, referrals, and care plans",
    order: 2,
  },
  {
    slug: "scheduling",
    title: "Scheduling",
    icon: "Calendar",
    description: "Creating shifts, check-ins, and managing schedules",
    order: 3,
  },
  {
    slug: "staff",
    title: "Staff Management",
    icon: "UserCog",
    description: "Managing staff, carers, and availability",
    order: 4,
  },
  {
    slug: "carers",
    title: "For Carers",
    icon: "Heart",
    description: "Guide for care workers using the platform",
    order: 5,
  },
  {
    slug: "sponsors",
    title: "For Sponsors",
    icon: "Home",
    description: "Guide for family members and sponsors",
    order: 6,
  },
  {
    slug: "billing",
    title: "Billing & Payroll",
    icon: "CreditCard",
    description: "Invoices, payments, and payroll management",
    order: 7,
  },
  {
    slug: "reports",
    title: "Reports & Analytics",
    icon: "BarChart3",
    description: "Trend reports, analytics, and data insights",
    order: 8,
  },
];

// Articles
export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    slug: "welcome",
    title: "Welcome to CareBase",
    category: "getting-started",
    description: "An introduction to the CareBase platform and its features",
    keywords: ["welcome", "introduction", "overview", "start"],
    order: 1,
    popular: true,
    content: `
# Welcome to CareBase

CareBase is a comprehensive home care management platform designed to streamline operations for care agencies, improve communication between caregivers and families, and ensure the highest quality of care for clients.

## What is CareBase?

CareBase brings together all aspects of home care management into one unified platform:

- **Client Management** - Track client information, care plans, and health records
- **Scheduling** - Create and manage caregiver shifts with ease
- **Visit Documentation** - Record visit notes, incidents, and care activities
- **Billing & Payroll** - Generate invoices and manage caregiver payments
- **Family Portal** - Keep sponsors informed about their loved one's care

## Who Uses CareBase?

CareBase is designed for different types of users:

### Administrators & Office Staff
Manage the overall operations, including client intake, scheduling, billing, and staff management.

### Care Workers (Carers)
Access schedules, check in/out of shifts, document visits, and report incidents.

### Family Sponsors
View care updates, visit notes, and invoices for their loved ones.

## Getting Help

If you need assistance:
- Browse this help center for guides and tutorials
- Contact your agency administrator for account-specific questions
- Use the search feature above to find specific topics

Ready to get started? Check out our [Navigating the Dashboard](/help/getting-started/navigation) guide next.
`,
  },
  {
    slug: "navigation",
    title: "Navigating the Dashboard",
    category: "getting-started",
    description: "Learn how to navigate the CareBase dashboard and find key features",
    keywords: ["navigation", "dashboard", "sidebar", "menu"],
    order: 2,
    popular: true,
    content: `
# Navigating the Dashboard

The CareBase dashboard is designed to give you quick access to the features you need most. This guide will help you understand the layout and navigation.

## The Sidebar

The sidebar on the left contains the main navigation menu. It's organized into groups:

### Client Management
- **Referrals** - New client referrals awaiting processing
- **Intake** - Clients in the intake/onboarding process
- **Clients** - All active clients
- **Assessments** - Client assessments and evaluations
- **Care Plans** - Care plan management

### Staff Management
- **Staff Directory** - View and manage all staff members
- **Sponsors** - Manage family sponsors

### Care Operations
- **Scheduling** - View and create shifts
- **Visit Notes** - Documentation from care visits
- **Incidents** - Incident reports and follow-ups

### Financials
- **Billing** - Invoice management
- **Payroll** - Caregiver payments

## The Header

The header at the top of the screen contains:

- **Notifications Bell** - Click to view alerts and notifications
- **Help Icon** - Quick access to this help center

## Dashboard Widgets

Your dashboard shows key information at a glance:

- Upcoming shifts
- Recent activity
- Alerts requiring attention
- Quick statistics

## Tips for Navigation

1. **Use the search** - The help search can quickly find specific topics
2. **Check notifications** - Red badges indicate items needing attention
3. **Bookmark pages** - Your browser can bookmark frequently used pages
`,
  },
  {
    slug: "your-role",
    title: "Understanding Your Role",
    category: "getting-started",
    description: "Learn what you can do based on your user role in CareBase",
    keywords: ["role", "permissions", "access", "admin", "carer", "sponsor"],
    order: 3,
    content: `
# Understanding Your Role

CareBase uses role-based access to ensure users see only the features and information relevant to them. Your role determines what you can view and do in the system.

## Available Roles

### Administrator (Admin)
Full access to all features including:
- All client and staff management
- System settings and configuration
- Billing and payroll
- User account management

### Operations Manager
Similar to Admin with access to:
- Client management
- Scheduling and operations
- Staff oversight
- Reports and analytics

### Clinical Director
Focused on care quality:
- Client assessments
- Care plan oversight
- Quality assurance
- Clinical reports

### Staff
Office staff with access to:
- Client management
- Scheduling
- Basic reporting

### Supervisor
Team leadership role:
- Oversee assigned carers
- Review visit notes
- Handle escalations

### Carer (Care Worker)
Frontline care delivery:
- View assigned schedules
- Check in/out of shifts
- Write visit notes
- Report incidents

### Sponsor (Family Member)
Family portal access:
- View loved one's care information
- Read visit notes
- View invoices
- Communicate with the care team

## Checking Your Role

Your current role is displayed:
- In the sidebar under your name
- On your profile page

If you believe you need different access, contact your administrator.
`,
  },

  // Client Management
  {
    slug: "adding-clients",
    title: "Adding a New Client",
    category: "clients",
    description: "Step-by-step guide to adding a new client to the system",
    keywords: ["add client", "new client", "create client", "intake"],
    order: 1,
    popular: true,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Adding a New Client

This guide walks you through the process of adding a new client to CareBase.

## Starting the Intake Process

1. Navigate to **Clients** in the sidebar
2. Click the **Add Client** button
3. Fill in the required information

## Required Information

### Basic Information
- **First Name** and **Last Name** - Client's legal name
- **Date of Birth** - Used for age-related care requirements
- **Phone Number** - Primary contact number
- **Address** - Service delivery location

### Emergency Contact
- Contact name and relationship
- Phone number
- This person will be contacted in emergencies

### Medical Information
- Primary diagnosis (if applicable)
- Allergies and medications
- Mobility status
- Special care requirements

## Assigning a Sponsor

A sponsor is typically a family member who:
- Receives updates about care
- Can view visit notes
- Receives invoices

To assign a sponsor:
1. Search for an existing sponsor, or
2. Send an invitation to create a new sponsor account

## After Adding a Client

Once the client is created:
1. Complete the **assessment** process
2. Create a **care plan**
3. Set up **authorizations** if required
4. Begin **scheduling** shifts

## Tips

- Double-check contact information for accuracy
- Add detailed notes about care preferences
- Set up the sponsor early so they can track onboarding
`,
  },
  {
    slug: "care-plans",
    title: "Creating Care Plans",
    category: "clients",
    description: "How to create and manage care plans for clients",
    keywords: ["care plan", "service plan", "goals", "interventions"],
    order: 2,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
    content: `
# Creating Care Plans

A care plan outlines the specific care and services a client will receive. This guide explains how to create effective care plans in CareBase.

## What is a Care Plan?

A care plan documents:
- Client goals and objectives
- Specific interventions and services
- Frequency and duration of care
- Responsible parties
- Review dates

## Creating a New Care Plan

1. Navigate to the client's profile
2. Click on **Care Plans** tab
3. Click **Create Care Plan**

## Care Plan Components

### Goals
Define what the client wants to achieve:
- Be specific and measurable
- Set realistic timeframes
- Include client preferences

Example: "Client will be able to prepare simple meals independently within 3 months."

### Interventions
Describe how goals will be achieved:
- List specific tasks and activities
- Assign responsible parties
- Set frequency (daily, weekly, etc.)

### Services
Document authorized services:
- Personal care assistance
- Medication reminders
- Meal preparation
- Transportation
- Companionship

## Reviewing and Updating

Care plans should be:
- Reviewed regularly (typically every 90 days)
- Updated when client needs change
- Shared with the care team
- Approved by clinical staff

## Best Practices

1. Involve the client and family in planning
2. Use clear, simple language
3. Be specific about tasks and timing
4. Document any limitations or restrictions
5. Update promptly when needs change
`,
  },

  // Scheduling
  {
    slug: "creating-shifts",
    title: "Creating and Managing Shifts",
    category: "scheduling",
    description: "Learn how to create, edit, and manage caregiver shifts",
    keywords: ["shift", "schedule", "assign", "create shift"],
    order: 1,
    popular: true,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SUPERVISOR"],
    content: `
# Creating and Managing Shifts

Effective scheduling ensures clients receive consistent care and carers have clear work assignments. This guide covers shift management in CareBase.

## Accessing the Schedule

Navigate to **Scheduling** in the sidebar to view:
- Calendar view of all shifts
- List view with filtering options
- Unassigned shifts requiring attention

## Creating a New Shift

1. Click **Create Shift** button
2. Select the **Client**
3. Choose the **Date and Time**
4. Set the **Duration**
5. Assign a **Carer** (optional)
6. Add any **Notes**
7. Click **Save**

## Shift Details

### Required Information
- Client
- Date and start time
- Duration or end time
- Service type

### Optional Information
- Assigned carer
- Special instructions
- Recurring schedule
- Authorization reference

## Assigning Carers

When assigning a carer, consider:
- Carer's availability
- Skills and certifications
- Client preferences
- Travel time between shifts
- Overtime limits

## Recurring Shifts

For regular schedules:
1. Create the first shift
2. Enable **Repeat** option
3. Select frequency (daily, weekly, etc.)
4. Set end date or number of occurrences

## Managing Changes

### Editing Shifts
- Click on a shift to edit
- Update details as needed
- Save changes

### Cancelling Shifts
- Open the shift
- Click **Cancel Shift**
- Select a reason
- Notify affected parties

### Finding Coverage
If a carer is unavailable:
1. Mark the shift as **Needs Coverage**
2. System will suggest available carers
3. Notify carers of open shift
4. Assign when coverage is confirmed

## Tips

- Schedule recurring shifts in advance
- Leave buffer time between shifts for travel
- Check carer availability before scheduling
- Use notes to communicate special instructions
`,
  },
  {
    slug: "check-in-out",
    title: "Check-In and Check-Out",
    category: "scheduling",
    description: "How the check-in and check-out process works for shifts",
    keywords: ["check in", "check out", "clock in", "clock out", "EVV"],
    order: 2,
    content: `
# Check-In and Check-Out

CareBase uses electronic visit verification (EVV) to document when care visits begin and end. This guide explains the check-in/check-out process.

## For Carers

### Checking In

When you arrive at a client's location:

1. Open CareBase on your device
2. Go to **Check In/Out** in the menu
3. Find your scheduled shift
4. Click **Check In**
5. Allow location access if prompted
6. Confirm the check-in

The system records:
- Time of check-in
- Your location (GPS)
- The shift details

### During the Visit

While at the client's home:
- Provide care as outlined in the care plan
- Document any important observations
- Note any concerns or incidents

### Checking Out

When you complete the visit:

1. Go to **Check In/Out**
2. Find your active shift
3. Click **Check Out**
4. Complete the visit note
5. Submit

## For Administrators

### Monitoring Check-Ins

From the dashboard, you can:
- See who is currently checked in
- View late check-ins
- Track shifts in progress

### Reviewing Visit Data

After shifts complete:
- Review check-in/out times
- Verify locations
- Check visit notes
- Approve for billing

## Common Issues

### Late Check-In
If a carer checks in late:
- The system flags the delay
- Supervisors receive an alert
- Carer may need to add an explanation

### Missed Check-In
If a check-in is missed:
- System sends reminder notifications
- Supervisor is alerted
- Manual entry may be required

### Location Issues
If location cannot be verified:
- Carer should ensure GPS is enabled
- Try again after a moment
- Contact supervisor if issues persist

## Best Practices

1. Check in as soon as you arrive
2. Ensure your device has GPS enabled
3. Complete visit notes before leaving
4. Report any issues promptly
`,
  },

  // For Carers
  {
    slug: "carer-getting-started",
    title: "Getting Started as a Carer",
    category: "carers",
    description: "Essential guide for care workers new to CareBase",
    keywords: ["carer", "caregiver", "care worker", "new carer"],
    order: 1,
    roles: ["CARER"],
    content: `
# Getting Started as a Carer

Welcome to CareBase! This guide will help you get up and running as a care worker using the platform.

## First Steps

### 1. Log In to Your Account
- Use the credentials provided by your agency
- Change your password on first login
- Set up your profile

### 2. Set Your Availability
- Go to **My Availability** in the menu
- Mark your available days and times
- Update when your availability changes

### 3. View Your Schedule
- Check **Scheduling** to see assigned shifts
- Review client details before visits
- Note any special instructions

## Your Daily Workflow

### Before Your Shift
1. Review the shift details
2. Check client care plan
3. Note any special requirements
4. Plan your travel time

### During Your Shift
1. Check in when you arrive
2. Provide care as planned
3. Document observations
4. Check out when leaving
5. Complete visit note

### After Your Shift
- Ensure visit note is submitted
- Report any concerns
- Check your next assignment

## Key Features for Carers

### Check In/Out
- Located in the main menu
- Use at start and end of each visit
- Enables GPS verification

### Visit Notes
- Document what happened during visit
- Record client condition
- Note any concerns
- Submit before leaving

### Incident Reporting
- Report any accidents or concerns
- Document falls, injuries, or issues
- Alert supervisors to problems

## Getting Help

If you need assistance:
- Contact your supervisor
- Call the office during business hours
- Check this help center
- Report urgent issues immediately

## Tips for Success

1. Always check in and out on time
2. Read care plans carefully
3. Document thoroughly
4. Communicate concerns promptly
5. Keep your availability updated
`,
  },
  {
    slug: "writing-visit-notes",
    title: "Writing Visit Notes",
    category: "carers",
    description: "How to write effective visit notes and documentation",
    keywords: ["visit note", "documentation", "notes", "record"],
    order: 2,
    roles: ["CARER", "SUPERVISOR"],
    content: `
# Writing Visit Notes

Visit notes are essential documentation of each care visit. Good notes help ensure continuity of care and protect both clients and carers.

## Why Visit Notes Matter

- Document care provided
- Track client condition over time
- Support billing verification
- Provide legal protection
- Enable team communication

## When to Write Notes

- Complete notes **before leaving** the client's home
- Submit within your shift time
- Don't wait until the end of the day

## What to Include

### Activities Completed
Document tasks performed:
- Personal care (bathing, grooming, dressing)
- Medication reminders
- Meal preparation
- Housekeeping
- Transportation
- Companionship activities

### Client Observations
Note the client's:
- General condition
- Mood and behavior
- Any changes from usual
- Concerns expressed

### Important Events
Document any:
- Falls or near-falls
- Health complaints
- Missed medications
- Visitor interactions
- Environmental issues

## Writing Tips

### Be Specific
**Instead of:** "Client seemed okay"
**Write:** "Client was alert and in good spirits, ate full lunch, walked with walker to living room"

### Be Objective
**Instead of:** "Client was difficult today"
**Write:** "Client declined personal care assistance, stating preference to do it independently"

### Be Timely
Write notes while details are fresh. Waiting leads to forgotten information.

### Be Accurate
- Use correct times
- Don't guess or assume
- Document what you directly observed

## Common Mistakes to Avoid

1. Vague descriptions
2. Missing information
3. Submitting late
4. Copy-pasting previous notes
5. Including personal opinions

## Templates

Your agency may have note templates. These help ensure:
- Consistent documentation
- Required fields are completed
- Important items aren't missed
`,
  },

  // For Sponsors
  {
    slug: "sponsor-portal",
    title: "Using the Sponsor Portal",
    category: "sponsors",
    description: "Guide for family members accessing the sponsor portal",
    keywords: ["sponsor", "family", "portal", "loved one"],
    order: 1,
    roles: ["SPONSOR"],
    content: `
# Using the Sponsor Portal

Welcome to CareBase! As a sponsor, you have access to information about your loved one's care. This guide will help you navigate the system.

## What is a Sponsor?

A sponsor is typically a family member or responsible party who:
- Receives updates about care
- Can view visit documentation
- Manages billing and invoices
- Communicates with the care team

## Logging In

1. Go to the CareBase login page
2. Enter your email and password
3. If you forgot your password, click "Forgot Password"

## Your Dashboard

When you log in, you'll see:
- Recent visits and notes
- Upcoming scheduled visits
- Any alerts or notifications
- Quick access to key information

## What You Can View

### Visit Notes
See documentation from each care visit:
- Date and time of visit
- Carer who provided care
- Activities completed
- Observations about your loved one

### Schedule
View upcoming visits:
- Scheduled dates and times
- Assigned caregivers
- Service types

### Invoices
Access billing information:
- Current and past invoices
- Payment status
- Billing details

## Communication

### Contacting the Agency
- Use the inbox feature to send messages
- Contact information is available in settings
- For emergencies, call the office directly

### Providing Feedback
Your input is valuable:
- Share concerns about care
- Praise excellent caregivers
- Suggest improvements

## Tips

1. Check the portal regularly for updates
2. Read visit notes to stay informed
3. Review invoices promptly
4. Communicate concerns early
5. Keep your contact information updated

## Privacy

Your loved one's information is protected:
- Only authorized users can access records
- All data is securely encrypted
- You only see information relevant to your family member
`,
  },

  // Billing
  {
    slug: "invoices-overview",
    title: "Understanding Invoices",
    category: "billing",
    description: "Overview of the invoicing system in CareBase",
    keywords: ["invoice", "bill", "payment", "charges", "overview"],
    order: 1,
    popular: true,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SPONSOR"],
    content: `
# Understanding Invoices

CareBase provides a comprehensive invoicing system to bill for care services. This guide explains how invoices work and how to manage them.

## Invoice Basics

An invoice is a bill sent to a sponsor (family member) or client for care services provided during a specific period.

### Key Information on an Invoice

- **Invoice Number** - Unique identifier (e.g., INV-2024-0001)
- **Billing Period** - Date range for services
- **Client** - Who received the care
- **Sponsor** - Who is responsible for payment (if different from client)
- **Line Items** - Individual services or shifts being billed
- **Subtotal** - Sum of all line items
- **Tax** - Applicable tax amount (if configured)
- **Total** - Final amount due
- **Due Date** - When payment is expected

### Invoice Statuses

| Status | Description |
|--------|-------------|
| **Draft** | Being prepared, not yet sent |
| **Pending** | Ready to send |
| **Sent** | Delivered to sponsor |
| **Partial** | Some payment received |
| **Paid** | Fully paid |
| **Overdue** | Past due date, unpaid |
| **Cancelled** | Voided, no longer valid |
| **Archived** | Hidden from active list, kept for records |

## For Sponsors

### Viewing Your Invoices

1. Navigate to **Invoices** in the sidebar
2. View list of all invoices for your loved one
3. Click on an invoice to see details

### Making Payments

Payment options depend on your agency:
- Online payment (if enabled)
- Check by mail
- Bank transfer
- Payment plan options

Contact your agency for specific payment methods.

### Common Questions

**Why is my invoice different than expected?**
Invoices reflect actual services provided. Differences may be due to:
- Shift changes or cancellations
- Different service rates
- Adjustments or credits applied

**How do I dispute a charge?**
Contact your agency with:
- Invoice number
- Specific line item in question
- Reason for dispute
`,
  },
  {
    slug: "creating-invoices",
    title: "Creating Invoices",
    category: "billing",
    description: "How to create and configure invoices for clients",
    keywords: ["create invoice", "new invoice", "billing", "generate"],
    order: 2,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Creating Invoices

This guide explains how to create invoices for client services in CareBase.

## Creating a New Invoice

### Step 1: Navigate to Invoices

1. Go to **Invoices** in the sidebar
2. Click the **Create Invoice** button

### Step 2: Select Client

1. Search for and select the **Client**
2. Optionally select a **Sponsor** (bill-to party)
   - If no sponsor selected, invoice goes to client

### Step 3: Set Invoice Details

- **Billing Period** - Start and end dates for services
- **Due Date** - When payment is expected
- **Currency** - USD, GBP, CAD, or NGN
- **Tax Rate** - Applicable tax percentage (0-100%)

### Step 4: Add Line Items

Each line item represents a charge:

#### From Shifts
1. Click **Add from Shifts**
2. Select completed shifts within the billing period
3. System auto-calculates hours and rates

#### Custom Items
1. Click **Add Custom Item**
2. Enter description
3. Set quantity and unit price
4. System calculates total

### Step 5: Review and Save

1. Review all line items and totals
2. Add any **Notes** for the sponsor
3. Click **Save as Draft** or **Create Invoice**

## Invoice Line Items

### Shift-Based Items

When adding shifts:
- **Description** - Auto-generated from shift details
- **Service Date** - Date of the shift
- **Quantity** - Hours worked
- **Rate** - Hourly rate from billing settings
- **Amount** - Quantity × Rate

### Custom Items

For non-shift charges:
- Supply costs
- Transportation fees
- Administrative charges
- One-time services

## Best Practices

1. **Review before sending** - Always check line items and totals
2. **Include clear descriptions** - Sponsors should understand each charge
3. **Set realistic due dates** - Typically 15-30 days
4. **Add helpful notes** - Explain any unusual charges
5. **Generate promptly** - Bill soon after service period ends
`,
  },
  {
    slug: "managing-invoices",
    title: "Managing Invoice Status",
    category: "billing",
    description: "How to send, archive, and manage invoice lifecycle",
    keywords: ["send invoice", "archive", "cancel", "status", "manage"],
    order: 3,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Managing Invoice Status

Learn how to manage invoices through their lifecycle - from draft to paid or archived.

## Invoice Lifecycle

\`\`\`
Draft → Pending → Sent → Paid
                    ↓
              Partial → Paid
                    ↓
              Overdue → Paid/Cancelled
                    ↓
              Archived
\`\`\`

## Status Actions

### Draft → Pending

Draft invoices are being prepared:
- Edit line items freely
- Change dates, amounts, tax
- Delete if not needed

To move to Pending:
1. Open the invoice
2. Review all details
3. Click **Mark as Pending**

### Pending → Sent

Pending invoices are ready to send:
1. Open the invoice
2. Click **Send Invoice**
3. System emails the sponsor with PDF attached
4. Status changes to **Sent**

### Recording Partial Payments

When a partial payment is received:
1. Open the invoice
2. Click **Record Payment**
3. Enter payment amount
4. Add payment date and notes
5. Status changes to **Partial**

### Marking as Paid

When fully paid:
- System auto-updates when payments equal total
- Or manually change status to **Paid**

### Handling Overdue Invoices

Invoices past due date can be:
- Marked as **Overdue** (manual or automatic)
- Send payment reminders
- Apply late fees (add custom line item)

## Cancelling Invoices

To void an invoice:
1. Open the invoice
2. Click **Cancel Invoice**
3. Confirm cancellation

**Note:** Cancelled invoices cannot be deleted but remain for records.

## Archiving Invoices

Archive invoices to hide them from the active list while keeping records.

### When to Archive

- Invoice is paid and no longer relevant
- Need to clean up the invoice list
- Cancelled invoices you don't want to see

### How to Archive

1. Open the invoice
2. Click **Archive** (or change status to Archived)
3. Invoice moves to archived view

### Viewing Archived Invoices

1. Go to **Invoices**
2. Use the status filter
3. Select **Archived** or **All**

### Restoring Archived Invoices

1. View archived invoices
2. Open the invoice
3. Change status to **Draft** or **Pending**

## Deleting Invoices

**Only these invoices can be deleted:**
- Draft status
- Cancelled status
- Archived status

**Cannot delete if:**
- Invoice has recorded payments
- Invoice was sent to sponsor

To delete:
1. Open the invoice
2. Click **Delete**
3. Confirm deletion

**Note:** Deletion is permanent. Archive instead if you may need records later.

## Best Practices

1. **Don't delete sent invoices** - Archive instead for audit trail
2. **Record all payments promptly** - Keeps accounts accurate
3. **Follow up on overdue invoices** - Send reminders before archiving
4. **Use notes** - Document status changes and communications
`,
  },
  {
    slug: "recording-payments",
    title: "Recording Payments",
    category: "billing",
    description: "How to record and track invoice payments",
    keywords: ["payment", "record payment", "partial payment", "paid"],
    order: 4,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Recording Payments

Track payments received against invoices to maintain accurate accounts receivable.

## Recording a Payment

### Step 1: Open the Invoice

1. Navigate to **Invoices**
2. Find and open the invoice
3. Click **Record Payment**

### Step 2: Enter Payment Details

- **Amount** - Payment amount received
- **Payment Date** - When payment was received
- **Payment Method** - Check, cash, transfer, etc.
- **Reference** - Check number, transaction ID, etc.
- **Notes** - Any additional details

### Step 3: Save Payment

1. Review the details
2. Click **Save Payment**
3. Invoice updates automatically

## Payment Effects

### Full Payment

When payment amount equals amount due:
- Status changes to **Paid**
- Paid date is recorded
- Amount due becomes $0

### Partial Payment

When payment is less than amount due:
- Status changes to **Partial**
- Amount due reduces by payment amount
- Multiple partial payments allowed

### Overpayment

If payment exceeds amount due:
- System may show credit balance
- Apply credit to future invoices
- Or process refund

## Viewing Payment History

Each invoice shows:
- All payments recorded
- Payment dates and amounts
- Who recorded the payment
- Running balance

## Editing Payments

To correct a payment:
1. Open the invoice
2. Find the payment in history
3. Click **Edit** (if available)
4. Make corrections
5. Save changes

**Note:** Some systems may require voiding and re-entering payments.

## Payment Reports

Generate payment reports to see:
- All payments received by date range
- Outstanding balances
- Aging receivables
- Payment trends

## Best Practices

1. **Record immediately** - Enter payments when received
2. **Include references** - Check numbers help with reconciliation
3. **Add notes** - Document special circumstances
4. **Reconcile regularly** - Match payments to bank statements
5. **Follow up on partial payments** - Track remaining balances
`,
  },
  {
    slug: "generating-invoices-from-shifts",
    title: "Generating Invoices from Shifts",
    category: "billing",
    description: "How to automatically generate invoices from completed shifts",
    keywords: ["generate", "auto invoice", "shifts", "batch", "bulk"],
    order: 5,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Generating Invoices from Shifts

CareBase can automatically generate invoices based on completed shifts, saving time and ensuring accuracy.

## Automatic Invoice Generation

### From Completed Shifts

When creating an invoice:
1. Select the client
2. Set the billing period
3. Click **Add from Shifts**
4. System finds all completed shifts in that period
5. Select shifts to include
6. Line items are auto-created

### Shift Data Used

Each shift creates a line item with:
- **Description** - Service type, carer name, date
- **Service Date** - Shift date
- **Quantity** - Hours worked (from check-in/out)
- **Rate** - From billing rate settings
- **Amount** - Hours × Rate

## Billing Rates

Rates are determined by:
1. **Service Type** - Different rates for different services
2. **Client** - Custom rates per client (if set)
3. **Day/Time** - Weekend or holiday rates
4. **Default Rate** - Fallback if no specific rate

### Setting Up Billing Rates

1. Go to **Settings > Billing**
2. Configure service types and rates
3. Set special rates for weekends/holidays
4. Configure client-specific rates if needed

## Batch Invoice Generation

### Generate for Multiple Clients

1. Go to **Invoices**
2. Click **Generate Invoices** (or Batch Generate)
3. Set the billing period
4. Select clients to invoice
5. Review generated invoices
6. Confirm and create

### Review Before Sending

Batch generation creates draft invoices:
- Review each for accuracy
- Make adjustments as needed
- Mark as pending when ready
- Send individually or in batch

## Handling Special Cases

### Cancelled Shifts

Cancelled shifts are typically excluded:
- Set to not appear in invoice generation
- Or include with $0 amount and note

### Adjusted Hours

If actual hours differ from scheduled:
- Use check-in/check-out times for accuracy
- Or manually adjust line item quantity

### Multiple Service Types

Shifts with multiple service types:
- Create separate line items per type
- Or consolidate with combined rate

### Split Billing

When multiple payers share costs:
- Create separate invoices per payer
- Allocate appropriate portions
- Reference the split in notes

## Tips for Efficient Invoicing

1. **Complete shifts promptly** - Ensure carers check out and submit notes
2. **Review before billing period ends** - Catch missing data early
3. **Use consistent billing periods** - Weekly, bi-weekly, or monthly
4. **Generate on schedule** - Same time each period for consistency
5. **Keep rates updated** - Review billing rates regularly
`,
  },
  {
    slug: "invoice-pdf-email",
    title: "Sending Invoice PDFs",
    category: "billing",
    description: "How to generate and send invoice PDFs to sponsors",
    keywords: ["pdf", "email", "send invoice", "download"],
    order: 6,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF"],
    content: `
# Sending Invoice PDFs

CareBase generates professional PDF invoices that can be emailed to sponsors or downloaded for printing.

## Generating Invoice PDFs

### View PDF

1. Open the invoice
2. Click **View PDF** or **Download PDF**
3. PDF opens in a new tab or downloads

### PDF Contents

The invoice PDF includes:
- Your company header and logo
- Invoice number and dates
- Client and sponsor information
- Itemized list of services
- Subtotal, tax, and total
- Payment terms and due date
- Notes and instructions

## Sending Invoices by Email

### Send Single Invoice

1. Open the invoice
2. Click **Send Invoice** (or **Email**)
3. System sends to sponsor's email
4. PDF is attached automatically
5. Status changes to **Sent**

### Email Contents

The email includes:
- Subject: Invoice #[number] from [Company]
- Greeting to sponsor
- Invoice summary
- Amount due and due date
- PDF attachment
- Contact information

### Custom Email Messages

Some agencies can customize:
- Email subject line
- Introduction text
- Payment instructions
- Closing message

## Resending Invoices

### When to Resend

- Sponsor didn't receive original
- Email bounced
- Updated contact information
- Reminder before due date

### How to Resend

1. Open the invoice
2. Click **Resend** or **Send Again**
3. Confirm sending
4. System sends another email with PDF

## Download for Printing

### Download PDF

1. Open the invoice
2. Click **Download PDF**
3. Save to your computer
4. Print as needed

### Batch Download

To download multiple invoices:
1. Select invoices from the list
2. Click **Download Selected**
3. System creates ZIP file with all PDFs

## Troubleshooting

### Email Not Received

Check:
- Sponsor email address is correct
- Email didn't go to spam folder
- No email delivery errors logged

### PDF Won't Generate

Ensure:
- Invoice has at least one line item
- All required fields are filled
- Try refreshing the page

### Wrong Information on PDF

1. Edit the invoice (if still in Draft)
2. Update incorrect information
3. Regenerate the PDF

## Best Practices

1. **Preview before sending** - Review PDF for accuracy
2. **Confirm email addresses** - Verify sponsor contacts
3. **Send promptly** - Bill while services are recent
4. **Keep copies** - Download PDFs for your records
5. **Follow up** - Check sent invoices were received
`,
  },

  // Reports & Analytics
  {
    slug: "trend-reports",
    title: "Visit Note Trend Reports",
    category: "reports",
    description: "Track client health metrics over time and share reports with sponsors",
    keywords: ["trends", "reports", "analytics", "graphs", "charts", "sponsor", "email"],
    order: 1,
    popular: true,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
    content: `
# Visit Note Trend Reports

Trend Reports allow you to track numeric values from visit notes over time and visualize client progress. You can create report templates, preview them with charts, and send professional PDF reports directly to sponsors via email.

## Accessing Trend Reports

1. Navigate to **Reports** in the sidebar
2. Click on **Visit Note Trends**

## Creating a Trend Report

### Step 1: Configure the Report

1. **Select a Template** - Choose the visit note template that contains the fields you want to track
2. **Select Fields** - Pick the numeric fields to include (e.g., blood pressure, weight, pain level)
3. **Set Time Range** - Choose from preset ranges (7, 30, or 90 days) or set a custom date range
4. **Choose Aggregation** - Select how to handle multiple entries per day:
   - **Latest Value** - Use the most recent reading
   - **Average** - Calculate the daily average
   - **First Value** - Use the first reading of the day

### Step 2: Preview with a Client

1. **Select a Client** - Choose a client to preview their trend data
2. **View Charts** - The system displays interactive line charts showing:
   - Data points over time
   - Average reference line
   - Trend direction (improving, stable, or worsening)
   - Statistics (min, max, average, count)

### Step 3: Save the Report Template

1. Click **Save Configuration**
2. Enter a **Report Name** (e.g., "Weekly Vitals Report")
3. Add an optional **Description**
4. Click **Save**

The saved template can be reused for any client - it stores the template, fields, time range, and aggregation settings.

## Sending Reports to Sponsors

Once you have a saved report, you can send it to one or multiple sponsors:

### Step 1: Open Send Modal

1. Click **Send to Sponsors** button
2. This opens the bulk send modal

### Step 2: Configure the Send

1. **Set Date Range** - Choose the time period for the report data
2. **Customize Email** (optional) - Click "Customize Email" to:
   - Set a custom **Subject Line**
   - Write a custom **Introduction Message**
   - Write a custom **Closing Message**
   - Use placeholders like [Client Name] and [Sponsor Name]

### Step 3: Select Recipients

1. **Search or Browse** - Find clients in the list
2. **Check Availability** - Clients without sponsors or sponsor emails are marked
3. **Select Clients** - Check the box next to each client to include
4. **Use Select All** - Quickly select all eligible clients

### Step 4: Preview PDF (Optional)

Before sending, you can preview the exact PDF that will be sent:
1. Click the **eye icon** next to any client
2. The PDF opens in a new tab showing exactly what will be attached
3. Review the charts and data for accuracy

### Step 5: Send Reports

1. Click **Send X Reports**
2. The system generates individual PDFs for each client
3. Emails are sent to each sponsor with the PDF attached

### Step 6: Review Results

After sending, you'll see a summary:
- **Sent** - Successfully delivered reports
- **Skipped** - Clients without data or valid recipients
- **Failed** - Any errors that occurred

## Understanding the PDF Report

The generated PDF includes professional line charts similar to the app:

### Header Section
- Company name
- Report title and template name
- Date range covered
- Client name

### Summary Table
- All tracked fields at a glance
- Average, min, max values
- Data point count
- Trend direction with color coding (green for improving, red for worsening)

### Individual Charts
Each field gets its own line chart showing:
- **Line Graph** - Visual trend over time with connected data points
- **Data Points** - Colored dots for each measurement
- **Average Line** - Dashed reference line showing the mean value
- **Y-Axis** - Value scale with grid lines
- **X-Axis** - Date labels
- **Trend Indicator** - Arrow showing improvement or decline
- **Statistics Row** - Detailed numbers below each chart

## Email Customization

### Default Email Content

Without customization, the email includes:
- Personalized greeting to sponsor
- Report details (template name, client name, period)
- Summary table of metrics and trends
- PDF attachment with charts
- Company signature

### Custom Content Options

**Subject Line:**
Default: "Trends Report: [Client Name] - [Report Name]"
Use [Client Name] and [Report Name] as placeholders

**Introduction Message:**
Replace the standard intro with your own message
Example: "Here is [Client Name]'s weekly progress update."

**Closing Message:**
Replace the standard closing
Example: "Please call us at (555) 123-4567 with any questions."

## Best Practices

### For Effective Reports

1. **Choose Meaningful Fields** - Track values that show client progress
2. **Use Consistent Templates** - Ensure carers complete the same fields each visit
3. **Set Appropriate Time Ranges** - Longer ranges show better trends
4. **Name Reports Clearly** - Use descriptive names like "Monthly Pain Assessment"

### For Sponsor Communication

1. **Send Regularly** - Weekly or monthly reports keep families informed
2. **Customize Messages** - Personal touches improve engagement
3. **Preview First** - Always verify data before sending
4. **Follow Up** - Be ready to answer questions about reports

## Troubleshooting

### No Data Available

If charts show "No data":
- Verify visit notes exist for the selected client
- Check that visit notes use the selected template
- Ensure the date range includes completed visits
- Confirm numeric fields have values entered

### Sponsor Has No Email

Clients are marked if:
- No sponsor is assigned
- Sponsor account has no email address

To fix: Go to the client profile and assign or update sponsor email.

### Report Won't Send

Check:
- Email service is configured correctly
- Sponsor email address is valid
- Data exists for the selected fields and date range
`,
  },
  {
    slug: "creating-report-templates",
    title: "Creating Report Templates",
    category: "reports",
    description: "How to create reusable report templates for consistent reporting",
    keywords: ["template", "report", "create", "save", "configuration"],
    order: 2,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
    content: `
# Creating Report Templates

Report templates allow you to save report configurations for reuse. Once created, a template can be used to generate reports for any client.

## What is a Report Template?

A report template saves:
- **Visit Note Template** - Which form to pull data from
- **Selected Fields** - Which numeric fields to track
- **Time Range** - Default reporting period
- **Aggregation Method** - How to handle multiple daily values

It does NOT save:
- Specific client selection (templates are client-agnostic)
- Custom email content (set when sending)

## Creating a Template

### Step 1: Configure Your Report

1. Go to **Reports > Visit Note Trends**
2. Select a **Template** from the dropdown
3. Choose **Fields** to include (click to select/deselect)
4. Set your preferred **Time Range**
5. Choose an **Aggregation Method**

### Step 2: Preview (Recommended)

1. Select any **Client** to preview
2. Review the charts and statistics
3. Verify the data looks correct
4. Adjust fields or settings if needed

### Step 3: Save the Template

1. Click **Save Configuration**
2. Enter a **Name** for your template (e.g., "Weekly Vitals Check")
3. Add a **Description** (optional but helpful)
4. Click **Save**

## Using Saved Templates

### Loading a Template

1. Go to **Reports > Visit Note Trends**
2. Click **Saved Reports** button (shows count)
3. Select a template from the dropdown
4. Template settings are loaded automatically
5. The **Send to Sponsors** button appears immediately

### Sending Reports from a Template

Once loaded:
1. The **Send to Sponsors** button appears in the header
2. Click it to open the send modal
3. Select clients and configure email
4. Preview PDFs if desired
5. Send reports

## Managing Templates

### Viewing All Templates

1. Click **Saved Reports** in the header
2. View all templates with their name, description, and creator

### Deleting Templates

1. Open the Saved Reports dropdown
2. Click **Delete** next to the template
3. Confirm deletion

## Template Best Practices

### Naming Conventions

Use clear, descriptive names:
- "Weekly Vitals - Blood Pressure and Weight"
- "Monthly Cognitive Assessment Trends"
- "Daily Pain Level Tracking"

### Field Selection

- Include related fields in one template
- Limit to 5-7 fields per report for readability
- Group logically (e.g., all vitals together)

### Time Ranges

Choose appropriate defaults:
- **7 days** - For daily check-ins, rapid changes
- **30 days** - Standard monthly reporting
- **90 days** - Quarterly reviews, long-term trends

### Aggregation Methods

- **Latest** - Best for single daily readings
- **Average** - Best for multiple readings per day
- **First** - Useful for morning-only measurements

## Common Use Cases

### Weekly Family Updates

- Time Range: 7 days
- Fields: Weight, blood pressure, mood score
- Schedule: Send every Friday

### Monthly Progress Reports

- Time Range: 30 days
- Fields: All tracked metrics
- Schedule: Send first week of each month

### Quarterly Clinical Reviews

- Time Range: 90 days
- Fields: Primary health indicators
- Schedule: Before care plan reviews
`,
  },
];

// FAQ Items
export const faqItems: FAQItem[] = [
  {
    question: "How do I reset my password?",
    answer: `To reset your password:
1. Go to the login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for a reset link
5. Click the link and create a new password

The link expires after 24 hours. If you don't receive the email, check your spam folder or contact your administrator.`,
    category: "account",
  },
  {
    question: "How do I update my contact information?",
    answer: `To update your contact information:
1. Click on your profile name in the sidebar
2. Go to Settings > Profile
3. Update your phone number, email, or address
4. Click Save

Note: Changing your email may require verification. Contact your administrator if you have issues.`,
    category: "account",
  },
  {
    question: "What do I do if I can't check in to my shift?",
    answer: `If you're having trouble checking in:
1. Ensure your device has GPS/location services enabled
2. Make sure you have an internet connection
3. Try closing and reopening the app
4. Refresh the page if using a browser

If problems persist, contact your supervisor immediately. They can help troubleshoot or manually record your check-in if needed.`,
    category: "scheduling",
  },
  {
    question: "How do I request time off?",
    answer: `To request time off:
1. Go to My Availability in the sidebar
2. Select the dates you need off
3. Mark them as unavailable
4. Add a note explaining the reason
5. Save your changes

Your supervisor will be notified. Make sure to submit requests well in advance for planned time off.`,
    category: "scheduling",
  },
  {
    question: "How do I report an incident?",
    answer: `To report an incident:
1. Go to Incidents in the sidebar
2. Click "Report Incident"
3. Select the client and date
4. Choose the incident type
5. Describe what happened in detail
6. Include any witnesses
7. Submit the report

For emergencies, call 911 first, then report in the system. Your supervisor will follow up on all incident reports.`,
    category: "care",
  },
  {
    question: "Who do I contact for technical support?",
    answer: `For technical support:
- Contact your agency administrator first
- They can help with account issues and basic troubleshooting
- For system-wide issues, they will escalate to CareBase support

When reporting issues, include:
- What you were trying to do
- What happened instead
- Any error messages you saw
- Your device and browser information`,
    category: "support",
  },
  {
    question: "How do I view my pay information?",
    answer: `To view your pay information:
1. Go to Payroll in the sidebar
2. View your pay periods and earnings
3. Click on a pay period for details
4. See hours worked, rates, and totals

For questions about specific payments, contact your agency's payroll administrator.`,
    category: "payroll",
  },
  {
    question: "How do I create an invoice?",
    answer: `To create an invoice:
1. Go to Invoices in the sidebar
2. Click "Create Invoice"
3. Select the client and optionally a sponsor
4. Set the billing period and due date
5. Add line items from shifts or create custom items
6. Review totals and add any notes
7. Save as draft or create the invoice

You can edit draft invoices before sending them to sponsors.`,
    category: "billing",
  },
  {
    question: "How do I archive an invoice?",
    answer: `To archive an invoice:
1. Go to Invoices and find the invoice
2. Open the invoice details
3. Change the status to "Archived" or click the Archive button

Archived invoices are hidden from the main list but kept for records. To view archived invoices, use the status filter and select "Archived" or "All".

To restore an archived invoice, change its status back to "Draft" or "Pending".`,
    category: "billing",
  },
  {
    question: "Can I delete an invoice?",
    answer: `You can only delete invoices that are:
- In Draft status
- Cancelled
- Archived

You cannot delete invoices that:
- Have been sent to sponsors
- Have recorded payments

To delete, open the invoice and click Delete. If you can't delete, consider archiving instead to hide it from the active list while keeping records.`,
    category: "billing",
  },
  {
    question: "How do I record a payment on an invoice?",
    answer: `To record a payment:
1. Open the invoice
2. Click "Record Payment"
3. Enter the payment amount
4. Select the payment date
5. Optionally add payment method and notes
6. Save the payment

The invoice will automatically update:
- Partial payments change status to "Partial"
- Full payments change status to "Paid"`,
    category: "billing",
  },
  {
    question: "How do I send an invoice to a sponsor?",
    answer: `To send an invoice:
1. Open the invoice (must be in Pending or higher status)
2. Click "Send Invoice" or "Email"
3. The system sends an email to the sponsor with the PDF attached
4. Status changes to "Sent"

Make sure the sponsor has a valid email address. You can resend invoices if needed.`,
    category: "billing",
  },
  {
    question: "Can I access CareBase on my phone?",
    answer: `Yes! CareBase is mobile-friendly:
- Open your phone's web browser
- Go to your agency's CareBase URL
- Log in with your credentials
- The site will adjust to your screen size

For the best experience:
- Use an up-to-date browser (Chrome, Safari, Firefox)
- Enable location services for check-in
- Keep your browser updated`,
    category: "technical",
  },
];

// Helper functions
export function getArticlesByCategory(category: string): HelpArticle[] {
  return helpArticles
    .filter((article) => article.category === category)
    .sort((a, b) => a.order - b.order);
}

export function getPopularArticles(): HelpArticle[] {
  return helpArticles.filter((article) => article.popular);
}

export function getArticleBySlug(category: string, slug: string): HelpArticle | undefined {
  return helpArticles.find(
    (article) => article.category === category && article.slug === slug
  );
}

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find((category) => category.slug === slug);
}

export function getRelatedArticles(article: HelpArticle, limit = 3): HelpArticle[] {
  return helpArticles
    .filter(
      (a) =>
        a.slug !== article.slug &&
        (a.category === article.category ||
          a.keywords.some((k) => article.keywords.includes(k)))
    )
    .slice(0, limit);
}
