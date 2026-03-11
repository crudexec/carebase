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

@Entity('varicella_attestation_form')
export class VaricellaAttestationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  had_chicken_pox: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  will_not_contract_chicken_pox: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  chicken_pox_not_serious_disease: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  side_effects_from_chicken_pox_vaccine: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  will_stay_home_if_infected: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other: string;

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
