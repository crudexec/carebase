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

import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';
import { Status } from 'types/genericEnums';

import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';

@Entity('visit_goal')
export class VisitGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  where_was_the_activity_practiced: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  indicate_circumstances_leading_to_activity: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  client_response_or_reaction_was: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  consequently_client_did: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  total_time_spent_on_activity: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  client_reward: string;

  @Column('simple-json', { nullable: true })
  goal_steps: {
    task_analysis: string;
    response: string;
    prompt_used: string;
    opportunities: string;
    success: string;
  }[];

  @Column({
    nullable: true,
    type: 'text',
  })
  additional_comments: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    nullable: true,
  })
  account_id: string;

  @Column({
    nullable: true,
  })
  treatment_plan_id: string;

  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentFullPlan: TreatmentFullPlan;

  @Column({
    nullable: true,
    type: 'text',
  })
  goal_background: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  short_term_objective: string;

  @Column({
    nullable: true,
  })
  visit_full_form_id: string;

  @ManyToOne(() => VisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: VisitFullForm;

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
