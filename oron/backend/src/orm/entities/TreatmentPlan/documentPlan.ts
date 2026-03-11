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
import { User } from '../User';
import { TreatmentPlanType } from 'types/genericEnums';

@Entity('treatment_plan_documents')
export class TreatmentPlanDocuments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  document_name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    nullable: true,
  })
  document_url: string;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

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
  uploaded_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
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
