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

import { User } from '../User';

import { AdmissionInformation } from './admissionInformation';

@Entity('waiver_services')
export class WaiverServices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  select_waiver_system: string;

  @Column({
    nullable: true,
  })
  service_end_date: Date;

  @Column({
    nullable: true,
  })
  service_start_date: Date;

  @Column({
    nullable: true,
  })
  amount_per_day_week_month: string;

  @Column({
    nullable: true,
  })
  amount_per_year: string;

  @Column({
    nullable: true,
  })
  admission_information_id: string;
  @ManyToOne(() => AdmissionInformation)
  admissionInformation: AdmissionInformation;

  @Column({
    nullable: true,
  })
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
