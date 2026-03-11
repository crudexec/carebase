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

import { TreatmentFullPlan } from './treatmentFullPlan';
import { TreatmentPlanType } from 'types/genericEnums';

@Entity('treatment_goal_signature')
export class TreatmentGoalSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  full_name: string;

  @Column({
    nullable: true,
  })
  signature_url: string;

  @Column({
    nullable: true,
  })
  parent_signature_url: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  parent_signed: boolean;

  @Column({
    nullable: true,
  })
  date_parent_signed: Date;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_plan_type: TreatmentPlanType;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

  @Column({
    nullable: true,
  })
  treatment_full_id: string;
  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_full_id' })
  treatmentFullForm: TreatmentFullPlan;

  @Column()
  signed_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'signed_by' })
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
