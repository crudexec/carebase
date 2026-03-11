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

import { User } from './User';

@Entity('employee_handbook')
export class EmployeeHandbook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  employee_first_name: string;

  @Column({
    nullable: true,
  })
  employee_last_name: string;

  @Column({
    nullable: true,
  })
  employee_email: string;

  @Column({
    nullable: true,
  })
  document_url: string;

  @Column()
  @CreateDateColumn()
  date_of_agreement: Date;

  @Column({
    nullable: true,
  })
  user_id: string;
  @ManyToOne(() => User)
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
