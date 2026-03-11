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

@Entity('pneumococcal_vaccination_information_form')
export class PneumococcalVaccinationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  had_pneumococcal_vaccination: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  declined_pneumococcal_vaccination: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  received_pneumococcal_vaccination: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  medical_contraindication: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  religious_beliefs: boolean;

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
