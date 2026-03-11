import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';
import { Status } from 'types/genericEnums';

import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';

@Entity('self_management')
export class SelfManagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  responding_to_others: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  sharing: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  increasing_on_task_behavior: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  initiating_interactions: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  conversing_with_others: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  increasing_play_skills: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  promoting_daily_living_skills: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  taking_turns: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  following_the_rules: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  reducing_occurence_of_interfering_behavior: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  cooperate_with_peers_in_group_activity: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other: boolean;

  @Column({
    nullable: true,
  })
  treatment_plan_id: string;

  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentFullPlan: TreatmentFullPlan;

  @Column({
    nullable: true,
  })
  visit_full_form_id: string;

  @ManyToOne(() => VisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: VisitFullForm;

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
