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
import { TreatmentFullPlan } from './treatmentFullPlan';

@Entity('shared_treatment_plan')
export class SharedTreatmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  recipient_name: string;

  @Column({
    nullable: true,
  })
  recipient_email: string;

  @Column({
    nullable: true,
  })
  recipient_role_or_position: string;

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
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
