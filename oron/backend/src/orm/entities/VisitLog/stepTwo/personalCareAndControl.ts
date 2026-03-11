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
import { VisitFullForm } from '../visitFullForm';

@Entity('personal_care_bowel_and_bladder_control')
export class PersonalCareAndBladderControl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  client_name_used_bathroom_without_assistance: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assisted_client_with_changing_diapers: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assisted_client_with_toileting: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_bowel: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_specify_bowel: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_shampooing: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_brushing_teeth: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_bathing: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_toweling: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_showering: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  supported_client_with_menstrual_care: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_personal_hygiene: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_specify_personal_hygiene: string;

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
