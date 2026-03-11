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

import { Status, TreatmentPlanType, TPType } from 'types/genericEnums';
import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';
import { TreatmentBasicInformation } from './basicInformation';
import { TreatmentSchedule } from './treatmentSchedule';

@Entity('treatment_full_plan')
export class TreatmentFullPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  basic_information_id: string;
  @ManyToOne(() => TreatmentBasicInformation)
  @JoinColumn({ name: 'basic_information_id' })
  basicInformation: TreatmentBasicInformation;

  @Column('simple-array', { nullable: true })
  treatment_goal_ids: string[];

  @Column({
    nullable: true,
  })
  treatment_schedule_id: string;
  @ManyToOne(() => TreatmentSchedule)
  @JoinColumn({ name: 'treatment_schedule_id' })
  treatmentSchedule: TreatmentSchedule;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_plan_type: TreatmentPlanType;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TPType,
    default: TPType.INITIAL,
  })
  tp_type: TreatmentPlanType;

  @Column({
    nullable: true,
  })
  tp_implemented_by: string;

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

  @Column({
    nullable: true,
  })
  parent_name: string;

  @Column({
    nullable: true,
  })
  parent_email: string;

  @Column({
    nullable: true,
  })
  relation_to_participant: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  active_treatment: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  parent_email_sent: boolean;

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
