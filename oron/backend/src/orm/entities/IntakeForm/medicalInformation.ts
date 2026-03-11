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

import { CitizenshipStatus } from 'types/genericEnums';
import { Gender, Ethnicity } from 'types/genericEnums';

import { User } from '../User';

@Entity('medical_information')
export class MedicalInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  diagnosis: string;

  @Column({
    nullable: true,
  })
  medical_history_or_allergies: string;

  @Column({
    nullable: true,
  })
  medications: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_comments: string;

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
