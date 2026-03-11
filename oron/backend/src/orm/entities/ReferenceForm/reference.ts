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

import { Status } from 'types/genericEnums';

import { User } from '../User';

@Entity('reference_form')
export class ReferenceForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  referrer_one_firstname: string;

  @Column({
    nullable: true,
  })
  referrer_one_lastname: string;

  @Column({
    nullable: true,
  })
  referrer_one_email: string;

  @Column({
    nullable: true,
  })
  referrer_one_phone: string;

  @Column({
    nullable: true,
  })
  referrer_two_firstname: string;

  @Column({
    nullable: true,
  })
  referrer_two_lastname: string;

  @Column({
    nullable: true,
  })
  referrer_two_email: string;

  @Column({
    nullable: true,
  })
  referrer_two_phone: string;

  @Column({
    nullable: true,
  })
  referrer_three_firstname: string;

  @Column({
    nullable: true,
  })
  referrer_three_lastname: string;

  @Column({
    nullable: true,
  })
  referrer_three_email: string;

  @Column({
    nullable: true,
  })
  referrer_three_phone: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    nullable: true,
    type: 'text',
  })
  review_notes: string;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  @CreateDateColumn()
  submitted_at: Date;

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
