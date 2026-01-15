import { UserRole } from "@prisma/client";

// Permission definitions based on requirements.md
export const PERMISSIONS = {
  // Client Onboarding
  ONBOARDING_VIEW: "onboarding:view",
  ONBOARDING_EDIT: "onboarding:edit",
  ONBOARDING_APPROVE: "onboarding:approve",
  ONBOARDING_FULL: "onboarding:full",

  // Scheduling
  SCHEDULING_VIEW: "scheduling:view",
  SCHEDULING_EDIT: "scheduling:edit",
  SCHEDULING_FULL: "scheduling:full",

  // Payroll
  PAYROLL_VIEW_OWN: "payroll:view_own",
  PAYROLL_VIEW: "payroll:view",
  PAYROLL_EDIT: "payroll:edit",
  PAYROLL_PROCESS: "payroll:process",
  PAYROLL_FULL: "payroll:full",

  // Incident Reports
  INCIDENT_CREATE: "incident:create",
  INCIDENT_VIEW: "incident:view",
  INCIDENT_VIEW_APPROVED: "incident:view_approved",
  INCIDENT_APPROVE: "incident:approve",
  INCIDENT_FULL: "incident:full",

  // Daily Reports (legacy)
  DAILY_REPORT_CREATE: "daily_report:create",
  DAILY_REPORT_VIEW: "daily_report:view",
  DAILY_REPORT_FULL: "daily_report:full",

  // Visit Notes (form-based daily reports)
  VISIT_NOTE_CREATE: "visit_note:create",
  VISIT_NOTE_VIEW: "visit_note:view",
  VISIT_NOTE_VIEW_ALL: "visit_note:view_all",
  VISIT_NOTE_FULL: "visit_note:full",

  // Form Templates
  FORM_TEMPLATE_VIEW: "form_template:view",
  FORM_TEMPLATE_MANAGE: "form_template:manage",
  FORM_TEMPLATE_FULL: "form_template:full",

  // Monthly Reports
  MONTHLY_REPORT_VIEW: "monthly_report:view",
  MONTHLY_REPORT_FULL: "monthly_report:full",

  // Chat
  CHAT_OWN: "chat:own",
  CHAT_MONITOR: "chat:monitor",
  CHAT_FULL: "chat:full",

  // Invoices
  INVOICE_VIEW: "invoice:view",
  INVOICE_MARK_PAID: "invoice:mark_paid",
  INVOICE_MANAGE: "invoice:manage",
  INVOICE_FULL: "invoice:full",

  // User Management
  USER_VIEW: "user:view",
  USER_MANAGE: "user:manage",
  USER_FULL: "user:full",

  // System Config
  SYSTEM_CONFIG: "system:config",

  // Escalations
  ESCALATION_CREATE: "escalation:create",
  ESCALATION_MANAGE: "escalation:manage",
  ESCALATION_FULL: "escalation:full",

  // Audit Logs
  AUDIT_LOG_VIEW: "audit_log:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role to permissions mapping based on requirements.md Section 6
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS), // Full access to everything

  OPS_MANAGER: [
    PERMISSIONS.ONBOARDING_FULL,
    PERMISSIONS.SCHEDULING_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.INCIDENT_APPROVE,
    PERMISSIONS.INCIDENT_FULL,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_VIEW_ALL,
    PERMISSIONS.FORM_TEMPLATE_MANAGE,
    PERMISSIONS.MONTHLY_REPORT_VIEW,
    PERMISSIONS.CHAT_MONITOR,
    PERMISSIONS.INVOICE_MANAGE,
    PERMISSIONS.ESCALATION_FULL,
    PERMISSIONS.AUDIT_LOG_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_MANAGE,
  ],

  CLINICAL_DIRECTOR: [
    PERMISSIONS.ONBOARDING_APPROVE,
    PERMISSIONS.ONBOARDING_VIEW,
    PERMISSIONS.SCHEDULING_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_VIEW_ALL,
    PERMISSIONS.FORM_TEMPLATE_VIEW,
    PERMISSIONS.MONTHLY_REPORT_VIEW,
  ],

  STAFF: [
    PERMISSIONS.ONBOARDING_VIEW,
    PERMISSIONS.SCHEDULING_EDIT,
    PERMISSIONS.PAYROLL_EDIT,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_VIEW_ALL,
    PERMISSIONS.FORM_TEMPLATE_VIEW,
    PERMISSIONS.MONTHLY_REPORT_VIEW,
    PERMISSIONS.INVOICE_MANAGE,
  ],

  SUPERVISOR: [
    PERMISSIONS.ONBOARDING_EDIT,
    PERMISSIONS.ONBOARDING_VIEW,
    PERMISSIONS.SCHEDULING_EDIT,
    PERMISSIONS.PAYROLL_EDIT,
    PERMISSIONS.INCIDENT_CREATE,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_VIEW_ALL,
    PERMISSIONS.FORM_TEMPLATE_VIEW,
    PERMISSIONS.MONTHLY_REPORT_VIEW,
    PERMISSIONS.ESCALATION_MANAGE,
  ],

  CARER: [
    PERMISSIONS.SCHEDULING_VIEW,
    PERMISSIONS.PAYROLL_VIEW_OWN,
    PERMISSIONS.INCIDENT_CREATE,
    PERMISSIONS.DAILY_REPORT_CREATE,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_CREATE,
    PERMISSIONS.VISIT_NOTE_VIEW,
    PERMISSIONS.CHAT_OWN,
    PERMISSIONS.ESCALATION_CREATE,
  ],

  SPONSOR: [
    PERMISSIONS.INCIDENT_VIEW_APPROVED,
    PERMISSIONS.DAILY_REPORT_VIEW,
    PERMISSIONS.VISIT_NOTE_VIEW,
    PERMISSIONS.MONTHLY_REPORT_VIEW,
    PERMISSIONS.CHAT_OWN,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_MARK_PAID,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Role hierarchy for UI purposes
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  OPS_MANAGER: "Operations Manager",
  CLINICAL_DIRECTOR: "Clinical Director",
  STAFF: "Staff",
  SUPERVISOR: "Supervisor",
  CARER: "Caregiver",
  SPONSOR: "Sponsor",
};

/**
 * Role colors for UI
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "role-admin",
  OPS_MANAGER: "role-ops-manager",
  CLINICAL_DIRECTOR: "role-clinical",
  STAFF: "role-staff",
  SUPERVISOR: "role-supervisor",
  CARER: "role-carer",
  SPONSOR: "role-sponsor",
};
