import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../User';

@Entity('documents')
export class Documents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    nullable: true,
  })
  issuing_authority: string;

  @Column({
    nullable: true,
  })
  document_number: string;

  @Column({
    nullable: true,
  })
  file_url: string;

  @Column({
    nullable: true,
  })
  expiration_date: Date;

  @Column()
  owner: string;
  @ManyToOne(() => User)
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
