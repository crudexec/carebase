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

@Entity('cjis_signature_form')
export class CJISSignatureForm {
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
  cjis_form_id: string;

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
