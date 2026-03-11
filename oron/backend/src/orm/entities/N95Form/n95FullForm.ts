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

import { N95FitAttestationForm } from './attestationForm';
import { N95FitSignatureForm } from './signatureForm';

@Entity('n95_fit_full_form')
export class N95FitFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  attestation_id: string;

  @OneToOne(() => N95FitAttestationForm, (form) => form.id)
  @JoinColumn({ name: 'attestation_id' })
  attestation: N95FitAttestationForm;

  @Column({
    nullable: true,
  })
  signature_id: string;
  @OneToOne(() => N95FitSignatureForm, (form) => form.id)
  @JoinColumn({ name: 'signature_id' })
  signature: N95FitSignatureForm;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

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
