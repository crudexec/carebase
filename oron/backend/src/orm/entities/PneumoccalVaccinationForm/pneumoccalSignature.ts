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

import { PneumococcalVaccinationForm } from './pneumococcalVaccinationForm';

@Entity('pneumococcal_signature')
export class PneumococcalSignatureForm {
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
  pneumococcal_form_id: string;
  @OneToOne(() => PneumococcalVaccinationForm, (form) => form.id)
  @JoinColumn({ name: 'pneumococcal_form_id' })
  form: PneumococcalVaccinationForm;

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
