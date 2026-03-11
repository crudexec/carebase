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

import { CJISFullForm } from './cjisFullForm';

@Entity('cjis_pre_registration_form')
export class CJISPreRegistrationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  pre_registration_pdf_url: string;

  @Column({
    nullable: true,
  })
  cjis_form_id: string;

  @OneToOne(() => CJISFullForm, (cjisFullForm) => cjisFullForm.id)
  @JoinColumn({ name: 'cjis_form_id' })
  cjisFullForm: CJISFullForm;

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
