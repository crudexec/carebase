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

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';

@Entity('specific_needs_service_needs')
export class ServiceNeeds {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Services needed
  @Column({ default: false })
  iiss: boolean;

  @Column({ default: false })
  therapeuticServices: boolean;

  @Column({ default: false })
  respite: boolean;

  @Column({ default: false })
  familyTraining: boolean;

  // Transportation services
  @Column({ default: false })
  transportToSchoolMorning: boolean;

  @Column({ default: false })
  transportFromSchoolToTI: boolean;

  @Column({ default: false })
  transportFromTIToHome: boolean;

  @Column({ default: false })
  transportToCommunity: boolean;

  // Transportation requirements
  @Column({ default: false })
  noSupervisionNeeded: boolean;

  @Column({ default: false })
  supervisionNeeded: boolean;

  @Column({ default: false })
  harnessNeeded: boolean;

  // Preferred caregiver information
  @Column({ default: false })
  hasPreferredCaregiver: boolean;

  @Column({ nullable: true })
  preferredCaregiverName: string;

  @Column({ nullable: true })
  preferredCaregiverPhone: string;

  @Column({ nullable: true })
  preferredCaregiverPhoneCountry: string;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

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
