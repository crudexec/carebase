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

@Entity('influenza_vaccination_declination')
export class InfluenzaVaccinationDeclinationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  aware_influenza_serious_disease: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  aware_vaccine_available_to_protect: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  can_shed_virus_after_contracting: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  can_spread_influenza_without_symptoms: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  my_influenza_vaccine_immunity_changes_every_year: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  can_not_get_influenza_from_vaccine: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  consequences_of_vaccination_refusal: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  reason_for_declining_vaccine: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  can_change_mind_and_accept_vaccine: boolean;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
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
