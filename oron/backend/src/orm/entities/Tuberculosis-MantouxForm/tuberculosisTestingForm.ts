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

@Entity('tuberculosis_mantoux_form')
export class TuberculosisMantouxForm {
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
  exposure_to_tb_past_two_weeks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  coughing_blood: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  profuse_night_sweats: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  loss_of_appetite: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  unexplained_weight_loss: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  chill_or_fever: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  persistent_cough_last_two_weeks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  chest_pain: boolean;

  @Column({
    nullable: true,
    type: Date,
  })
  last_chest_xray_date: Date;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  spent_time_with_tb_patient_in_the_last_two_years: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  were_you_born_in_a_country_where_tb_is_common: boolean;

  @Column({
    nullable: true,
  })
  country_of_birth: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  traveled_to_a_country_where_tb_is_common: boolean;

  @Column({
    nullable: true,
  })
  country_of_travel: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  members_of_family_traveled_to_US_from_another_country: boolean;

  @Column({
    nullable: true,
  })
  family_country_of_travel: string;

  @Column()
  owner: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner' })
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
