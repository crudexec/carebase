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

import { PpdAdministrationForm } from './ppdAdministrationForm';
import { TuberculosisSignatureForm } from './tuberculosisFormSignature';
import { TuberculosisMantouxForm } from './tuberculosisTestingForm';
@Entity('tuberculosis_full_form')
export class TuberculosisFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  ppd_administration_form_id: string;
  @OneToOne(() => PpdAdministrationForm, (form) => form.id)
  @JoinColumn({ name: 'ppd_administration_form_id' })
  ppd_administration_form: PpdAdministrationForm;

  @Column({
    nullable: true,
  })
  tuberculosis_testing_form_id: string;
  @OneToOne(() => TuberculosisMantouxForm, (form) => form.id)
  @JoinColumn({ name: 'tuberculosis_testing_form_id' })
  tuberculosis_testing_form: TuberculosisMantouxForm;

  @Column({
    nullable: true,
  })
  tb_signature_id: string;
  @OneToOne(() => TuberculosisSignatureForm, (form) => form.id)
  @JoinColumn({ name: 'tb_signature_id' })
  tb_signature: TuberculosisSignatureForm;

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
  owner: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner' })
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
