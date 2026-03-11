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
import { TreatmentPlanType, Gender } from 'types/genericEnums';

@Entity('specific_needs_basic_information')
export class SpecificNeedsBasicInformation {
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
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({
    nullable: true,
  })
  date_of_birth: Date;

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
  home_address: string;

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
  specific_needs_implemented_by: string;

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
