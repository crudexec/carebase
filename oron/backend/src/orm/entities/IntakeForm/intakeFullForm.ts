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

import { IntakeFormStatus } from 'types/genericEnums';

import { User } from '../User';

import { AdmissionInformation } from './admissionInformation';
import { ClientInformation } from './clientInformation';
import { IntakeEmergencyContactInformation } from './emergencyContactInformation';
import { FatherContactInformation } from './fatherContactInformation';
import { IntakeInformation } from './intakeInformation';
import { MedicalInformation } from './medicalInformation';
import { MoreAboutInformation } from './moreAboutClient';
import { MotherContactInformation } from './motherContactInformation';
import { ReferralInformation } from './referralInformation';
import { SchoolContactInformation } from './schoolContactInformation';
import { ServiceCoordinatorInformation } from './serviceCoordinatorInformation';

@Entity('intake_full_form')
export class IntakeFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  first_name: string;

  @Column({
    nullable: true,
  })
  last_name: string;

  @Column({
    nullable: true,
  })
  account_id: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: IntakeFormStatus,
    default: IntakeFormStatus.Draft,
  })
  status: IntakeFormStatus;

  @Column({
    nullable: true,
  })
  admission_information_id: string;
  @OneToOne(() => AdmissionInformation, (admissionInformation) => admissionInformation.id)
  @JoinColumn({ name: 'admission_information_id' })
  admissionInformation: AdmissionInformation;

  @Column({
    nullable: true,
  })
  client_information_id: string;
  @OneToOne(() => ClientInformation, (clientInformation) => clientInformation.id)
  @JoinColumn({ name: 'client_information_id' })
  clientInformation: ClientInformation;

  @Column({
    nullable: true,
  })
  father_contact_information_id: string;
  @OneToOne(() => FatherContactInformation, (fatherContactInformation) => fatherContactInformation.id)
  @JoinColumn({ name: 'father_contact_information_id' })
  fatherContactInformation: FatherContactInformation;

  @Column({
    nullable: true,
  })
  mother_contact_information_id: string;
  @OneToOne(() => MotherContactInformation, (motherContactInformation) => motherContactInformation.id)
  @JoinColumn({ name: 'mother_contact_information_id' })
  motherContactInformation: MotherContactInformation;

  @Column({
    nullable: true,
  })
  school_contact_information_id: string;
  @OneToOne(() => SchoolContactInformation, (schoolContactInformation) => schoolContactInformation.id)
  @JoinColumn({ name: 'school_contact_information_id' })
  schoolContactInformation: SchoolContactInformation;

  @Column({
    nullable: true,
  })
  service_coordinator_information_id: string;
  @OneToOne(() => ServiceCoordinatorInformation, (serviceCoordinatorInformation) => serviceCoordinatorInformation.id)
  @JoinColumn({ name: 'service_coordinator_information_id' })
  serviceCoordinatorInformation: ServiceCoordinatorInformation;

  @Column({
    nullable: true,
  })
  more_about_information_id: string;
  @OneToOne(() => MoreAboutInformation, (moreAboutInformation) => moreAboutInformation.id)
  @JoinColumn({ name: 'more_about_information_id' })
  moreAboutInformation: MoreAboutInformation;

  @Column({
    nullable: true,
  })
  medical_information_id: string;
  @OneToOne(() => MedicalInformation, (medicalInformation) => medicalInformation.id)
  @JoinColumn({ name: 'medical_information_id' })
  medicalInformation: MedicalInformation;

  @Column({
    nullable: true,
  })
  referral_information_id: string;
  @OneToOne(() => ReferralInformation, (referralInformation) => referralInformation.id)
  @JoinColumn({ name: 'referral_information_id' })
  referralInformation: ReferralInformation;

  @Column({
    nullable: true,
  })
  intake_information_id: string;
  @OneToOne(() => IntakeInformation, (intakeInformation) => intakeInformation.id)
  @JoinColumn({ name: 'intake_information_id' })
  intakeInformation: IntakeInformation;

  @Column({
    nullable: true,
  })
  emergency_contact_information_id: string;
  @OneToOne(() => IntakeEmergencyContactInformation, (emergencyContactInformation) => emergencyContactInformation.id)
  @JoinColumn({ name: 'emergency_contact_information_id' })
  emergencyContactInformation: IntakeEmergencyContactInformation;

  @Column({
    nullable: true,
  })
  profile_picture: string;

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
