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

import { N95FitAttestationForm } from './attestationForm';

@Entity('n95_fit_signature')
export class N95FitSignatureForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  signature_data: string;

  @Column({
    nullable: true,
  })
  full_name: string;

  @Column({
    nullable: true,
  })
  date_of_filling_form: Date;

  @Column()
  signed_by: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'signed_by' })
  user: User;

  @Column({
    nullable: true,
  })
  n95_form_id: string;
  @OneToOne(() => N95FitAttestationForm, (form) => form.id)
  @JoinColumn({ name: 'n95_form_id' })
  form: N95FitAttestationForm;

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
