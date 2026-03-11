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

import { CitizenshipForm } from './citizenship';
import { Documents } from './document';
import { PersonalInformation } from './personalInformation';
import { Signature } from './signature';

@Entity('i9_form')
export class I9Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json', {
    nullable: true,
  })
  filled_pdf_json_data: {};

  @Column({
    nullable: true,
  })
  personal_information_id: string;
  @OneToOne(() => PersonalInformation, (personalInformation) => personalInformation.id)
  @JoinColumn({ name: 'personal_information_id' })
  personalInformation: PersonalInformation;

  @Column({
    nullable: true,
  })
  citizenship_form_id: string;
  @OneToOne(() => CitizenshipForm, (citizenshipForm) => citizenshipForm.id)
  @JoinColumn({ name: 'citizenship_form_id' })
  citizenshipForm: CitizenshipForm;

  @Column({
    nullable: true,
  })
  document_id: string;
  @OneToOne(() => Documents, (document) => document.id)
  @JoinColumn({ name: 'document_id' })
  document: Documents;

  @Column({
    nullable: true,
  })
  signature_id: string;
  @OneToOne(() => Signature, (signature) => signature.id)
  @JoinColumn({ name: 'signature_id' })
  signature: Signature;

  @Column({
    nullable: true,
  })
  owner: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner' })
  user: User;

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
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
