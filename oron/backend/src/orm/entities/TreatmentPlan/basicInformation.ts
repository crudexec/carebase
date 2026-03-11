import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';
import { TreatmentPlanType, TPType } from 'types/genericEnums';

@Entity('treatment_basic_information')
export class TreatmentBasicInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  participant_first_name: string;

  @Column({
    nullable: true,
  })
  participant_last_name: string;

  @Column({
    nullable: true,
  })
  participant_father_name: string;

  @Column({
    nullable: true,
  })
  participant_mother_name: string;

  @Column({
    nullable: true,
  })
  father_mobile_number: string;

  @Column({
    nullable: true,
  })
  mother_mobile_number: string;

  @Column({
    nullable: true,
  })
  address_street_information: string;

  @Column({
    nullable: true,
  })
  country: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  county: string;

  @Column({
    nullable: true,
  })
  apartment_number: string;

  @Column({
    nullable: true,
  })
  zip_code: string;

  @Column({
    nullable: true,
  })
  implementation_start_date: Date;

  @Column({
    nullable: true,
  })
  implementation_stop_date: Date;

  @Column({
    nullable: true,
    type: 'text',
  })
  participant_background_information: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  behavior_intervention_protocol: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  transport_requirements_and_recommendations: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_plan_type: TreatmentPlanType;

  @Column({
    nullable: true,
    type: 'text',
  })
  statement_of_family_strength_and_resources: string;

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
    type: Boolean,
    default: false,
  })
  requires_data_collection: boolean;

  @Column({
    nullable: true,
  })
  meeting_attendance: string;

  @Column({
    nullable: true,
  })
  introduction: string;

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
