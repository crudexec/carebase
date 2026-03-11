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
} from 'typeorm';

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';

import { Events } from './events';

@Entity('rescheduled_event_log')
export class RescheduledEventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  new_rescheduled_event_date: Date;

  @Column({
    nullable: true,
  })
  start_time: string;

  @Column({
    nullable: true,
  })
  end_time: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  reason_for_rescheduling: string;

  @Column({
    nullable: true,
  })
  former_event_id: string;

  @ManyToOne(() => Events)
  @JoinColumn({ name: 'former_event_id' })
  events: Events;

  @Column({
    nullable: true,
  })
  client_intake_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'client_intake_id' })
  intakeFullForm: IntakeFullForm;

  @Column({
    nullable: true,
    type: 'text',
  })
  notes: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  should_repeat: boolean;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  reschedule_approved: boolean;

  @Column({
    nullable: true,
  })
  account_id: string;

  @Column()
  rescheduled_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'rescheduled_by' })
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
