import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { User } from '../User';
import { TreatmentPlanType } from 'types/genericEnums';

@Entity('treatment_schedule')
export class TreatmentSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  start_date: Date;

  @Column({
    nullable: true,
  })
  end_date: Date;

  @Column({
    nullable: true,
  })
  google_calendar_event_id: string;

  @Column('simple-json', { nullable: true })
  time_slot: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];

  @Column({
    nullable: true,
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_plan_type: TreatmentPlanType;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

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
