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
    slug: "invoices",
    title: "Understanding Invoices",
    category: "billing",
    description: "How to view and manage invoices in CareBase",
    keywords: ["invoice", "bill", "payment", "charges"],
    order: 1,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SPONSOR"],
    content: `
# Understanding Invoices

CareBase generates invoices for care services provided. This guide explains how invoices work and how to manage them.

## For Sponsors

### Viewing Your Invoices

1. Navigate to **Invoices** in the sidebar
2. View list of all invoices
3. Click on an invoice to see details

### Invoice Details

Each invoice shows:
- Invoice number and date
- Billing period
- Services provided
- Hours and rates
- Total amount due
- Payment status

### Making Payments

Payment options depend on your agency:
- Online payment (if enabled)
- Check by mail
- Bank transfer
- Payment plan options

Contact your agency for specific payment methods.

## For Administrators

### Generating Invoices

Invoices can be generated:
- Automatically based on completed visits
- Manually for special charges
- In batch for multiple clients

### Invoice Status

- **Draft** - Being prepared
- **Sent** - Delivered to sponsor
- **Paid** - Payment received
- **Overdue** - Past payment due date
- **Void** - Cancelled

### Managing Invoices

You can:
- Edit draft invoices
- Send reminders for overdue invoices
- Record payments received
- Generate statements
- Export for accounting

## Common Questions

### Why is my invoice different than expected?
Invoices reflect actual services provided. Check:
- Shift changes or cancellations
- Different service rates
- Adjustments or credits

### How do I dispute a charge?
Contact your agency with:
- Invoice number
- Specific item in question
- Reason for dispute

### Where can I see payment history?
View all past invoices and payments in the Invoices section.
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
