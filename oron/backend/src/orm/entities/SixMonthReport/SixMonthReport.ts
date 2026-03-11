import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { TreatmentFullPlan } from '../TreatmentPlan/treatmentFullPlan';
import { User } from '../User';
import { TreatmentPlanType } from 'types/genericEnums';

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

@Entity('six_month_reports')
export class SixMonthReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TreatmentPlanType,
    nullable: false,
  })
  report_type: TreatmentPlanType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportPeriod,
    default: ReportPeriod.CUSTOM,
  })
  period: ReportPeriod;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: false })
  end_date: Date;

  // Foreign Keys
  @Column({ nullable: false })
  treatment_plan_id: string;

  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentPlan: TreatmentFullPlan;

  @Column({ nullable: false })
  intake_id: string;

  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_id' })
  intake: IntakeFullForm;

  @Column({ nullable: false })
  generated_by_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by_id' })
  generatedBy: User;

  // Report Data Sections (stored as JSON)
  @Column({ type: 'json', nullable: true })
  executive_summary: {
    total_visits: number;
    total_hours: number;
    key_achievements: string[];
    areas_of_concern: string[];
    overall_progress: string;
  };

  @Column({ type: 'json', nullable: true })
  behavioral_management: {
    behaviors: Array<{
      behavior: string;
      frequency: number;
      interventions: string[];
      outcomes: string[];
      trend: 'improving' | 'stable' | 'declining';
    }>;
    most_frequent_behaviors: string[];
    successful_interventions: string[];
    recommendations: string[];
  };

  @Column({ type: 'json', nullable: true })
  significant_life_events: Array<{
    date: Date;
    event: string;
    category: 'concern' | 'challenge' | 'achievement' | 'milestone';
    impact: string;
    response: string;
  }>;

  @Column({ type: 'json', nullable: true })
  skills_progress: {
    communication: {
      baseline: number;
      current: number;
      goals_met: string[];
      areas_for_improvement: string[];
    };
    self_management: {
      baseline: number;
      current: number;
      goals_met: string[];
      areas_for_improvement: string[];
    };
    socialization: {
      baseline: number;
      current: number;
      goals_met: string[];
      areas_for_improvement: string[];
    };
    daily_living: {
      baseline: number;
      current: number;
      goals_met: string[];
      areas_for_improvement: string[];
    };
    behavioral_management: {
      baseline: number;
      current: number;
      goals_met: string[];
      areas_for_improvement: string[];
    };
  };

  @Column({ type: 'json', nullable: true })
  session_highlights_summary: Array<{
    date: Date;
    highlights: string[];
    activities: string[];
    outcomes: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  concerns_and_challenges_summary: Array<{
    date: Date;
    concern: string;
    severity: 'low' | 'medium' | 'high';
    action_taken: string;
    follow_up_needed: boolean;
    resolution_status: 'resolved' | 'ongoing' | 'escalated';
  }>;

  @Column({ type: 'json', nullable: true })
  visit_attendance: {
    total_scheduled: number;
    total_attended: number;
    total_cancelled: number;
    total_rescheduled: number;
    attendance_rate: number;
    cancellation_reasons: string[];
  };

  @Column({ type: 'json', nullable: true })
  goals_assessment: {
    goals_set: number;
    goals_achieved: number;
    goals_in_progress: number;
    goals_not_started: number;
    achievement_rate: number;
    revised_goals: string[];
  };

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  next_period_goals: string;

  @Column({ type: 'text', nullable: true })
  additional_notes: string;

  @Column({ type: 'text', nullable: true })
  supervisor_comments: string;

  @Column({ type: 'boolean', default: false })
  is_final: boolean;

  @Column({ nullable: true })
  finalized_at: Date;

  @Column({ nullable: true })
  finalized_by_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'finalized_by_id' })
  finalizedBy: User;

  // File storage for exported reports
  @Column({ type: 'text', nullable: true })
  pdf_url: string;

  @Column({ type: 'text', nullable: true })
  pdf_generated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}