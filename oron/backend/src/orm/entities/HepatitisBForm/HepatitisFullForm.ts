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

import { HepatitisBAttestationForm } from './attestationForm';
import { PersonalInformationHepatitisBForm } from './personalInformation';
import { HepatitisBSignatureForm } from './signatureForm';

@Entity('hepatitis_b_full_form')
export class HepatitisBFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  personal_information_id: string;
  @OneToOne(() => PersonalInformationHepatitisBForm, (form) => form.id)
  @JoinColumn({ name: 'personal_information_id' })
  personal_information: PersonalInformationHepatitisBForm;

  @Column({
    nullable: true,
  })
  attestation_id: string;
  @OneToOne(() => HepatitisBAttestationForm, (form) => form.id)
  @JoinColumn({ name: 'attestation_id' })
  attestation: HepatitisBAttestationForm;

  @Column({
    nullable: true,
  })
  signature_id: string;
  @OneToOne(() => HepatitisBSignatureForm, (form) => form.id)
  @JoinColumn({ name: 'signature_id' })
  signature: HepatitisBSignatureForm;

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
