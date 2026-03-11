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

import { User } from '../User';

import { EmployeePersonalInformation } from './personalInformation';

@Entity('emergency_contact_information')
export class EmergencyContactInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    nullable: true,
  })
  relationship_to_employee: string;

  @Column({
    nullable: true,
  })
  street_address: string;

  @Column({
    nullable: true,
  })
  phone: string;

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

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: true,
  })
  employee_personal_information_id: string;
  @OneToOne(() => EmployeePersonalInformation, (personalInformation) => personalInformation.id)
  @JoinColumn({ name: 'employee_personal_information_id' })
  personalInformation: EmployeePersonalInformation;

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
