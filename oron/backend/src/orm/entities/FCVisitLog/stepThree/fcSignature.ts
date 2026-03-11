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

import { User } from '../../User';
import { Status } from 'types/genericEnums';
import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';
import { FcVisitFullForm } from '../fcVisitFullForm';
@Entity('fc_treatment_plan_signature')
export class FcTreatmentPlanSignature {
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
  signed: boolean;

  @Column({
    nullable: true,
  })
  visit_full_form_id: string;

  @ManyToOne(() => FcVisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: FcVisitFullForm;

  @Column({
    nullable: true,
  })
  treatment_full_id: string;
  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_full_id' })
  treatmentFullForm: TreatmentFullPlan;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column({
    nullable: true,
  })
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
