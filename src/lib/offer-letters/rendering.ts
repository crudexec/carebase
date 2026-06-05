import type { UserRole } from "@prisma/client";

export interface OfferEmployeeData {
  id?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: UserRole | null;
  profile?: Record<string, unknown> | null;
}

export interface OfferCompanyData {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export type OfferData = Record<string, unknown>;

export interface OfferRenderContext {
  employee: OfferEmployeeData;
  company: OfferCompanyData;
  offer: OfferData;
}

const TAG_PATTERN = /\{([a-zA-Z0-9_.]+)\}/g;

export const DEFAULT_OFFER_TAGS = [
  "employee.firstName",
  "employee.lastName",
  "employee.email",
  "employee.phone",
  "employee.role",
  "company.name",
  "company.address",
  "company.phone",
];

export function extractOfferTags(content: string): string[] {
  const tags = new Set<string>();
  for (const match of content.matchAll(TAG_PATTERN)) {
    tags.add(match[1]);
  }
  return Array.from(tags).sort();
}

export function validateOfferTags(
  content: string,
  context: OfferRenderContext
): { tags: string[]; unknownTags: string[] } {
  const tags = extractOfferTags(content);
  const unknownTags = tags.filter((tag) => getContextValue(context, tag) === undefined);
  return { tags, unknownTags };
}

export function renderOfferTemplate(
  template: string,
  context: OfferRenderContext
): string {
  return template.replace(TAG_PATTERN, (_match, tag: string) => {
    const value = getContextValue(context, tag);
    if (value === undefined || value === null) {
      return "";
    }
    return escapeHtml(formatValue(value));
  });
}

export function buildRecipientSnapshot(employee: OfferEmployeeData): Record<string, unknown> {
  return {
    id: employee.id ?? null,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone ?? null,
    role: employee.role ?? null,
    profile: employee.profile ?? null,
  };
}

function getContextValue(context: OfferRenderContext, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = context;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

function formatValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US");
  }
  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
