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

@Entity('hepatitis_b_attestation')
export class HepatitisBAttestationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  had_hepatitis_b_vaccine_series_of_three: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  arranged_for_hepatitis_b_vaccine_series_of_three: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  declined_hepatitis_b_vaccine_series_of_three: boolean;

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
