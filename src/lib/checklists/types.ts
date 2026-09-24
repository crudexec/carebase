export type ItemStatus = "PENDING" | "SUBMITTED" | "APPROVED";
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
}
export interface ChecklistItemData {
  id: string;
  title: string;
  status: ItemStatus;
  position: number;
  submittedAt: string | null;
  approvedAt: string | null;
  submittedBy: Person | null;
  approvedBy: Person | null;
  comments: { id: string; body: string; createdAt: string; author: Person }[];
  attachments: {
    id: string;
    fileName: string;
    size: number;
    createdAt: string;
    author: Person;
  }[];
}
export interface ChecklistData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  assigneeId: string;
  assignee: Person;
  items: ChecklistItemData[];
}
export interface ChecklistResponse {
  checklist: ChecklistData | null;
  isAdmin: boolean;
  userId: string;
  visible?: boolean;
}
export interface TemplateData {
  id: string;
  title: string;
  description: string;
  items: string[];
  archived: boolean;
}

export async function checklistRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to save changes");
  return data as T;
}
export function jsonRequest(method: string, data: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
