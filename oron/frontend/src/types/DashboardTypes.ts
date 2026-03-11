export interface DashboardMetrics {
  totalClients: number;
  totalEmployees: number;
  pendingApprovals: number;
  recentSubmissions: number;
}

export interface PendingVisit {
  id: string;
  client_name: string;
  visit_type: string;
  submitted_date: string;
  staff_name: string;
  status: string;
}

export interface PendingVisitsResponse {
  visits: PendingVisit[];
  total: number;
  page: number;
  size: number;
}

export interface GoalSummary {
  goal_number: number;
  target_skill: string;
  steps_completed: number;
}

export interface VisitDetails extends PendingVisit {
  client_id: string;
  client_age: string;
  location: string | null;
  goals_count: number;
  goals_summary: GoalSummary[];
  session_highlights?: string | null;
}
