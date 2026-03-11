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

import { Status } from 'types/genericEnums';

import { User } from './User';

@Entity('user_document')
export class UserDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  document_url: string;

  @Column()
  document_title: string;

  @Column()
  owner: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner' })
  user: User;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    nullable: true,
    type: 'text',
  })
  review_notes: string;

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
