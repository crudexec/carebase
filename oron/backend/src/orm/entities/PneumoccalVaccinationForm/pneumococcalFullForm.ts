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

import { EmployeeInformation } from './employeeInformationForm';
import { PneumococcalSignatureForm } from './pneumoccalSignature';
import { PneumococcalVaccinationForm } from './pneumococcalVaccinationForm';

@Entity('pneumococcal_full_form')
export class PneumococcalVaccinationFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  employee_information_id: string;
  @OneToOne(() => EmployeeInformation, (employeeInformation) => employeeInformation.id)
  @JoinColumn({ name: 'employee_information_id' })
  employeeInformation: EmployeeInformation;

  @Column({
    nullable: true,
  })
  pneumococcal_vaccination_form_id: string;
  @OneToOne(() => PneumococcalVaccinationForm, (pneumococcalVaccinationForm) => pneumococcalVaccinationForm.id)
  @JoinColumn({ name: 'pneumococcal_vaccination_form_id' })
  pneumococcalVaccinationForm: PneumococcalVaccinationForm;

  @Column({
    nullable: true,
  })
  pneumococcal_signature_id: string;
  @OneToOne(() => PneumococcalSignatureForm, (pneumococcalSignatureForm) => pneumococcalSignatureForm.id)
  @JoinColumn({ name: 'pneumococcal_signature_id' })
  pneumococcalSignatureForm: PneumococcalSignatureForm;

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
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
