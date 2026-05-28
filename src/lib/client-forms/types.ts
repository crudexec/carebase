import { ClientFormRequestStatus, ClientFormSubmissionStatus, FormTemplateStatus } from "@prisma/client";
import type { FormSectionData } from "@/lib/visit-notes/types";

export interface ClientFormTemplateSettings {
  access: {
    isPublic: boolean;
    allowAuthenticatedAccess: boolean;
    requireRequestTokenForPublic: boolean;
    allowMultipleSubmissionsPerRequest: boolean;
    defaultExpirationDays?: number | null;
  };
  display: {
    showClientName: boolean;
    showClientDob: boolean;
    publicTitle?: string | null;
    publicDescription?: string | null;
    successMessage?: string | null;
  };
  collection: {
    collectSubmitterName: boolean;
    collectSubmitterEmail: boolean;
  };
}

export const DEFAULT_CLIENT_FORM_TEMPLATE_SETTINGS: ClientFormTemplateSettings = {
  access: {
    isPublic: false,
    allowAuthenticatedAccess: true,
    requireRequestTokenForPublic: true,
    allowMultipleSubmissionsPerRequest: false,
    defaultExpirationDays: 7,
  },
  display: {
    showClientName: true,
    showClientDob: false,
    publicTitle: null,
    publicDescription: null,
    successMessage: "Form submitted successfully.",
  },
  collection: {
    collectSubmitterName: true,
    collectSubmitterEmail: true,
  },
};

export interface ClientFormTemplateListItem {
  id: string;
  name: string;
  description?: string | null;
  status: FormTemplateStatus;
  version: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: ClientFormTemplateSettings | null;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export interface ClientFormRequestListItem {
  id: string;
  status: ClientFormRequestStatus;
  expiresAt: string | null;
  maxSubmissions: number | null;
  submissionCount: number;
  recipientName: string | null;
  recipientEmail: string | null;
  createdAt: string;
  template: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ClientFormSubmissionListItem {
  id: string;
  status: ClientFormSubmissionStatus;
  submittedAt: string;
  isPublicSubmission: boolean;
  submittedByName: string | null;
  submittedByEmail: string | null;
  template: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface ClientFormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  description?: string | null;
  settings: ClientFormTemplateSettings;
  sections: FormSectionData[];
}
