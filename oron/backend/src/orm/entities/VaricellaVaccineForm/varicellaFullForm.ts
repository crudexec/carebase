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

import { VaricellaEmployeeInformation } from './personalInformation';
import { VaricellaAttestationForm } from './varicellaAttestation';
import { VaricellaSignatureForm } from './varicellaSignatureForm';

@Entity('varicella_full_form')
export class VaricellaFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  personal_information_id: string;
  @OneToOne(() => VaricellaEmployeeInformation, (form) => form.id)
  @JoinColumn({ name: 'personal_information_id' })
  personal_information: VaricellaEmployeeInformation;

  @Column({
    nullable: true,
  })
  attestation_id: string;
  @OneToOne(() => VaricellaAttestationForm, (form) => form.id)
  @JoinColumn({ name: 'attestation_id' })
  attestation: VaricellaAttestationForm;

  @Column({
    nullable: true,
  })
  signature_id: string;
  @OneToOne(() => VaricellaSignatureForm, (form) => form.id)
  @JoinColumn({ name: 'signature_id' })
  signature: VaricellaSignatureForm;

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

  @Column({
    nullable: true,
  })
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
