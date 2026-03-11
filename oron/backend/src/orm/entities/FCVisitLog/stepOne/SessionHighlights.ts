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

@Entity('fc_session_highlights')
export class FcSessionHighlights {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  session_ocurred_in: string;

  @Column({
    nullable: true,
    type: 'simple-array',
  })
  those_present_for_the_family_consultant_session: string[];

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
