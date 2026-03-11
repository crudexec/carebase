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

@Entity('behavior_management')
export class BehaviorManagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  behavior_type: string;

  @Column({
    nullable: true,
  })
  behavior_description: string;

  @Column({
    nullable: true,
  })
  what_time_did_behavior_occur: string;

  @Column({
    nullable: true,
  })
  antecedent: string;

  @Column({
    nullable: true,
  })
  consequence: string;

  @Column({
    nullable: true,
  })
  setting: string;

  @Column({
    nullable: true,
  })
  how_many_times_did_behavior_occur: string;

  @Column({
    nullable: true,
  })
  for_how_long_did_behavior_occur: string;

  @Column({
    nullable: true,
  })
  severity: string;

  @Column({
    nullable: true,
  })
  other_crisis_intervention: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_specific_description: string;

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
