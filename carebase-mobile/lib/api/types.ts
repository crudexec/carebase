// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  profileImageUrl?: string;
  phone?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'COORDINATOR' | 'CARER';

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}

// Client types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  careNeeds?: string;
  notes?: string;
  profileImageUrl?: string;
  status: ClientStatus;
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface ClientSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}

// Shift types
export interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: ShiftStatus;
  notes?: string;
  client: ClientSummary;
  carer?: UserSummary;
  checkInId?: string;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
}

export type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Visit Note types
export interface VisitNote {
  id: string;
  templateName: string;
  templateVersion?: number;
  submittedAt: string;
  formSchemaSnapshot?: FormSchemaSnapshot;
  data?: Record<string, any>;
  shift?: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
  };
  client?: ClientSummary;
  carer?: UserSummary;
  submittedBy?: UserSummary;
}

export interface FormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections?: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  description?: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config?: FormFieldConfig;
}

export type FormFieldType =
  | 'TEXT_SHORT'
  | 'TEXT_LONG'
  | 'NUMBER'
  | 'YES_NO'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'SIGNATURE'
  | 'PHOTO'
  | 'RATING_SCALE';

export interface FormFieldConfig {
  options?: string[];
  min?: number;
  max?: number;
  minValue?: number;
  maxValue?: number;
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: FormTemplateStatus;
  isEnabled: boolean;
  sections?: FormSection[];
}

export type FormTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

// Dashboard types
export interface DashboardStats {
  shiftsToday: number;
  activeClients: number;
  pendingNotes: number;
  hoursThisWeek: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
}

// Check-in types
export interface CheckIn {
  id: string;
  shiftId: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: Location;
  checkOutLocation?: Location;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}

// Incident types
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Incident {
  id: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  description: string;
  actionsTaken: string;
  witnesses?: string;
  attachments: string[];
  status: IncidentStatus;
  sponsorNotified: boolean;
  createdAt: string;
  client: ClientSummary;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
}

export interface CreateIncidentRequest {
  clientId: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  description: string;
  actionsTaken: string;
  witnesses?: string | null;
}

export interface IncidentsResponse {
  incidents: Incident[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IncidentResponse {
  incident: Incident;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SessionResponse {
  user?: User;
}
