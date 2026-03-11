export interface StaffMember {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
}

export interface AssignedStaff {
  id: string;
  staff: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
  assigned_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assigned_at: string;
}

export interface AssignmentHistoryRecord {
  id: string;
  staff: {
    id: string;
    name: string;
  };
  action: "assigned" | "unassigned";
  action_by: {
    id: string;
    name: string;
  };
  notes?: string;
  timestamp: string;
}

export interface AssignmentHistoryResponse {
  history: AssignmentHistoryRecord[];
  total: number;
  page: number;
  size: number;
}
