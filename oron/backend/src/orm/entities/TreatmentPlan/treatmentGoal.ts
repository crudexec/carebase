import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';
import { TreatmentPlanType } from 'types/genericEnums';

@Entity('treatment_goal')
export class TreatmentGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  goal_area: string;

  @Column({
    nullable: true,
  })
  target_skill: string;

  @Column({
    nullable: true,
  })
  short_term_objective: string;

  @Column('simple-json', { nullable: true })
  objective_term_steps: {
    task_analysis: string;
    baseline: string;
  }[];

  @Column({
    nullable: true,
  })
  goal_status: string;

  @Column({
    nullable: true,
  })
  goal_setting: string;

  @Column({
    nullable: true,
  })
  number_of_trials: number;

  @Column({
    nullable: true,
  })
  goal_frequency: string;

  @Column({
    nullable: true,
  })
  current_skill_level: string;

  @Column({
    nullable: true,
  })
  target_performance_level: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  goal_background: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  goal_statement: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  implementation_procedure: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_plan_type: TreatmentPlanType;

  @Column('simple-array', { nullable: true })
  evaluating_progress: string[];

  @Column('simple-array', { nullable: true })
  reinforcers: string[];

  @Column('simple-array', { nullable: true })
  materials: string[];

  @Column({
    nullable: true,
    type: 'text',
  })
  progress_monitoring: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  mastery_towards_goal_achievement: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  expected_outcome: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  goal_comment: string;

  @Column({
    nullable: true,
  })
  present_level: string;

  @Column({
    nullable: true,
  })
  target_level: string;

  @Column('simple-array', { nullable: true })
  consequences: string[];

  @Column({
    nullable: true,
  })
  treatment_plan_id: string;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

  @Column()
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
