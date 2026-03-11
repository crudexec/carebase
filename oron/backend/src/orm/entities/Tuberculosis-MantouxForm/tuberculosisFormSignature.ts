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

import { TuberculosisMantouxForm } from './tuberculosisTestingForm';

@Entity('tb_signature')
export class TuberculosisSignatureForm {
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
  tb_form_id: string;
  @OneToOne(() => TuberculosisMantouxForm, (form) => form.id)
  @JoinColumn({ name: 'tb_form_id' })
  form: TuberculosisMantouxForm;

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
