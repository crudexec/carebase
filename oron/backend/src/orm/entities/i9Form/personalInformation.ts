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

@Entity('personal_information')
export class PersonalInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    nullable: true,
  })
  middle_name: string;

  @Column({
    nullable: true,
  })
  other_last_name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    nullable: true,
  })
  apartment_number: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
  })
  zip_code: string;

  @Column({
    nullable: true,
    unique: true,
    length: 9,
  })
  social_security_number: string;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    default: false,
  })
  form_completed: boolean;

  @Column({
    nullable: true,
  })
  form_completed_by: string;

  @Column({
    nullable: true,
  })
  form_filled_by: string;

  @Column({
    nullable: true,
  })
  @CreateDateColumn()
  form_completed_at: Date;

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
