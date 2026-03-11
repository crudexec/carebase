import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

import { Role } from './types';

@Entity('company_account')
export class CompanyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    default: 'creed',
  })
  name: string;

  @Column({
    nullable: true,
    default: 'creed',
  })
  account_id: string;

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
