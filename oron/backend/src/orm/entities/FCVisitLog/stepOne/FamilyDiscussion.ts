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
import { FcVisitFullForm } from '../fcVisitFullForm';

@Entity('fc_family_discussion')
export class FcFamilyDiscussion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  accomplishments_client_made_void_of_family_consultation_treatment: string; // client_accomplishments

  @Column({
    nullable: true,
    type: 'text',
  })
  accomplishments_client_family_made_void_of_family_consultation_treatment: string; // family_accomplishments

  @Column({
    nullable: true,
    type: 'text',
  })
  topic_not_related_discussed_during_family_consultation: string;

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
  visit_full_form_id: string;

  @ManyToOne(() => FcVisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: FcVisitFullForm;

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
