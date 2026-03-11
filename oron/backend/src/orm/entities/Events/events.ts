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

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';

@Entity('events')
export class Events {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  client_intake_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'client_intake_id' })
  intakeFullForm: IntakeFullForm;

  @Column({
    nullable: true,
  })
  client_name: string;

  @Column({
    nullable: true,
  })
  employee_or_staff_name: string;

  @Column({
    nullable: true,
  })
  employee_or_staff_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_or_staff_id' })
  staff: User;

  @Column({
    nullable: true,
  })
  event_date: Date;

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
  was_rescheduled: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  declination_reason: string;

  @Column({
    nullable: true,
  })
  declination_date: Date;

  @Column({
    nullable: true,
  })
  account_id: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  event_approved: boolean;

  @Column()
  scheduled_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'scheduled_by' })
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
