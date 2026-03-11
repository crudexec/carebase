export enum ReportStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportPeriod {
  FIRST_SIX_MONTHS = 'first_six_months',
  SECOND_SIX_MONTHS = 'second_six_months',
  CUSTOM = 'custom',
}

export enum TreatmentPlanType {
  IISS_ASSESSMENT = 'IISS_Assessment',
  FC_ASSESSMENT = 'FC_Assessment',
  ITI_ASSESSMENT = 'ITI_Assessment',
}

export interface ExecutiveSummary {
  total_visits: number;
  total_hours: number;
  key_achievements: string[];
  areas_of_concern: string[];
  overall_progress: string;
}

export interface BehaviorData {
  behavior: string;
  frequency: number;
  interventions: string[];
  outcomes: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface BehavioralManagement {
  behaviors: BehaviorData[];
  most_frequent_behaviors: string[];
  successful_interventions: string[];
  recommendations: string[];
}

export interface SignificantLifeEvent {
  date: Date | string;
  event: string;
  category: 'concern' | 'challenge' | 'achievement' | 'milestone';
  impact: string;
  response: string;
}

export interface SkillProgress {
  baseline: number;
  current: number;
  goals_met: string[];
  areas_for_improvement: string[];
}

export interface SkillsProgress {
  communication: SkillProgress;
  self_management: SkillProgress;
  socialization: SkillProgress;
  daily_living: SkillProgress;
  behavioral_management: SkillProgress;
}

export interface SessionHighlight {
  date: Date | string;
  highlights: string[];
  activities: string[];
  outcomes: string[];
}

export interface ConcernChallenge {
  date: Date | string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  action_taken: string;
  follow_up_needed: boolean;
  resolution_status: 'resolved' | 'ongoing' | 'escalated';
}

export interface VisitAttendance {
  total_scheduled: number;
  total_attended: number;
  total_cancelled: number;
  total_rescheduled: number;
  attendance_rate: number;
  cancellation_reasons: string[];
}

export interface GoalsAssessment {
  goals_set: number;
  goals_achieved: number;
  goals_in_progress: number;
  goals_not_started: number;
  achievement_rate: number;
  revised_goals: string[];
}

export interface SixMonthReport {
  id: string;
  report_type: TreatmentPlanType;
  status: ReportStatus;
  period: ReportPeriod;
  start_date: Date | string;
  end_date: Date | string;
  treatment_plan_id: string;
  intake_id: string;
  generated_by_id: string;
  executive_summary?: ExecutiveSummary;
  behavioral_management?: BehavioralManagement;
  significant_life_events?: SignificantLifeEvent[];
  skills_progress?: SkillsProgress;
  session_highlights_summary?: SessionHighlight[];
  concerns_and_challenges_summary?: ConcernChallenge[];
  visit_attendance?: VisitAttendance;
  goals_assessment?: GoalsAssessment;
  recommendations?: string;
  next_period_goals?: string;
  additional_notes?: string;
  supervisor_comments?: string;
  is_final: boolean;
  finalized_at?: Date | string;
  finalized_by_id?: string;
  pdf_url?: string;
  pdf_generated_at?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string;
  // Relations
  treatmentPlan?: any;
  intake?: any;
  generatedBy?: any;
  finalizedBy?: any;
}

export interface GenerateReportRequest {
  treatment_plan_id: string;
  start_date: string;
  end_date: string;
  report_type: TreatmentPlanType;
  period?: ReportPeriod;
}

export interface ReportListResponse {
  reports: SixMonthReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportReportResponse {
  html: string;
  data: any;
  filename: string;
}