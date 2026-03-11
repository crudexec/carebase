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

import { Gender, Ethnicity } from 'types/genericEnums';
import { Status } from 'types/genericEnums';

import { User } from '../User';

@Entity('employee_personal_information')
export class EmployeePersonalInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    nullable: true,
  })
  date_of_birth: Date;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  home_phone_number: string;

  @Column({
    nullable: true,
  })
  street_address: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
  })
  zip_code: string;

  @Column({
    nullable: true,
    enum: Gender,
  })
  gender: Gender;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Ethnicity,
  })
  race_or_ethinicity: Ethnicity;

  @Column({
    nullable: true,
    unique: true,
    length: 9,
  })
  social_security_number: string;

  @Column({
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
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
