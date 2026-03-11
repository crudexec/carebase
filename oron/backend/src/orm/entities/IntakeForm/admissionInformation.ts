import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../User';

import { WaiverServices } from './waiverService';

@Entity('admission_information')
export class AdmissionInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  poc_authorization_number: string;

  @Column({
    nullable: true,
  })
  poc_start_date: Date;

  @Column({
    nullable: true,
  })
  poc_end_date: Date;

  @Column({
    nullable: true,
  })
  waiver_services: string;
  @OneToMany(() => WaiverServices, (waiverServices) => waiverServices.id)
  @JoinColumn({ name: 'waiver_services' })
  waiverServices: WaiverServices;

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
