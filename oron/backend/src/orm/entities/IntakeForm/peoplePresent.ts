import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../User';

import { IntakeInformation } from './intakeInformation';
@Entity('people_present_information')
export class PeoplePresentInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  first_name: string;

  @Column({
    nullable: true,
  })
  relationship_to_participant: string;

  @Column()
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column({
    nullable: true,
  })
  intake_information_id: string;
  @ManyToOne(() => IntakeInformation)
  @JoinColumn({ name: 'intake_information_id' })
  intakeInformation: IntakeInformation;

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
