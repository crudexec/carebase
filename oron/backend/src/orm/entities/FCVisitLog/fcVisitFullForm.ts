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
import { Status } from 'types/genericEnums';
import { FcFamilyDiscussion } from './stepOne/FamilyDiscussion';
import { FcSessionHighlights } from './stepOne/SessionHighlights';
import { FcTreatmentPlanSignature } from './stepThree/fcSignature';
import { FcOtherTraining } from './stepThree/otherTraining';

import { User } from '../User';

@Entity('fc_visit_full_form')
export class FcVisitFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  session_highlights_id: string;
  @ManyToOne(() => FcSessionHighlights)
  @JoinColumn({ name: 'session_highlights_id' })
  sessionHighlights: FcSessionHighlights;

  @Column({
    nullable: true,
  })
  family_discussion_id: string;
  @ManyToOne(() => FcFamilyDiscussion)
  @JoinColumn({ name: 'family_discussion_id' })
  familyDiscussion: FcFamilyDiscussion;

  @Column({
    nullable: true,
  })
  treatment_plan_signature_id: string;
  @ManyToOne(() => FcTreatmentPlanSignature)
  @JoinColumn({ name: 'treatment_plan_signature_id' })
  treatmentPlanSignature: FcTreatmentPlanSignature;

  @Column({
    nullable: true,
  })
  other_training_id: string;
  @ManyToOne(() => FcOtherTraining)
  @JoinColumn({ name: 'other_training_id' })
  otherTraining: FcOtherTraining;

  @Column('simple-array', { nullable: true })
  visit_goal_ids: string[];

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
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
  })
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column({
    nullable: true,
  })
  date_of_visit: Date;

  @Column({
    nullable: true,
  })
  start_time: string;

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
  end_time: string;

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
