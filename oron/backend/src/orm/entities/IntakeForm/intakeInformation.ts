import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../User';

import { PeoplePresentInformation } from './peoplePresent';

@Entity('intake_information')
export class IntakeInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  who_conducted_intake: string;

  @Column({
    nullable: true,
  })
  date_of_intake: Date;

  @Column({
    nullable: true,
  })
  people_present: string;

  @OneToMany(() => PeoplePresentInformation, (peoplePresentInformation) => peoplePresentInformation.id)
  @JoinColumn({ name: 'people_present' })
  peoplePresentInformation: PeoplePresentInformation;

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
