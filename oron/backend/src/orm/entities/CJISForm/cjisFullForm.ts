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

import { CJISEmployeeInformation } from './cjisEmployeeInformation';
import { CJISPreRegistrationForm } from './cjisPreRegistration';
import { CJISSignatureForm } from './cjisSignature';

@Entity('cjis_full_form')
export class CJISFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  employee_information_id: string;

  @OneToOne(() => CJISEmployeeInformation, (employeeInformation) => employeeInformation.id)
  @JoinColumn({ name: 'employee_information_id' })
  employeeInformation: CJISEmployeeInformation;

  @Column({
    nullable: true,
  })
  signature_id: string;

  @OneToOne(() => CJISSignatureForm, (signature) => signature.id)
  @JoinColumn({ name: 'signature_id' })
  signature: CJISSignatureForm;

  @Column({
    nullable: true,
  })
  pre_registration_id: string;

  @OneToOne(() => CJISPreRegistrationForm, (preRegistration) => preRegistration.id)
  @JoinColumn({ name: 'pre_registration_id' })
  preRegistration: CJISPreRegistrationForm;

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
