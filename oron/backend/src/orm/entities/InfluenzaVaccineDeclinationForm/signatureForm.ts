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

import { InfluenzaVaccinationDeclinationForm } from './declinationInfluenzaForm';

@Entity('influenza_signature')
export class InfluenzaSignatureForm {
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
  influenza_form_id: string;
  @OneToOne(() => InfluenzaVaccinationDeclinationForm, (form) => form.id)
  @JoinColumn({ name: 'influenza_form_id' })
  form: InfluenzaVaccinationDeclinationForm;

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
