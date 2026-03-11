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

import { VaricellaAttestationForm } from './varicellaAttestation';

@Entity('varicella_signature')
export class VaricellaSignatureForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  signature_data: string;

  @Column()
  signed_by: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'signed_by' })
  user: User;

  @Column({
    nullable: true,
  })
  varicella_form_id: string;
  @OneToOne(() => VaricellaAttestationForm, (form) => form.id)
  @JoinColumn({ name: 'varicella_form_id' })
  form: VaricellaAttestationForm;

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
