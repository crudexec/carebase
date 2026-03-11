import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../User';

import { TuberculosisMantouxForm } from './tuberculosisTestingForm';

@Entity('ppd_administration_form')
export class PpdAdministrationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  had_tb_infection: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  had_positive_tb_skin_test: boolean;

  @Column({
    nullable: true,
  })
  had_tb_infection_date: Date;

  @Column({
    nullable: true,
  })
  had_positive_tb_skin_test_date: Date;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  have_you_been_immunized_with_bcg_vaccine: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  immunization_description: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  vaccine_past_two_weeks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  steriod_injection_past_two_weeks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  steriods_past_four_weeks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  exposure_to_tb_after_last_tb_test: boolean;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: true,
  })
  tuberculosisMantouxForm_id: string;
  @OneToOne(() => TuberculosisMantouxForm, (tuberculosisMantouxForm) => tuberculosisMantouxForm.id)
  @JoinColumn({ name: 'tuberculosisMantouxForm_id' })
  tuberculosisMantouxForm: TuberculosisMantouxForm;

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
