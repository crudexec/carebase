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

import { CitizenshipStatus } from 'types/genericEnums';

import { User } from '../User';

@Entity('citizenship_form')
export class CitizenshipForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CitizenshipStatus,
  })
  citizenship_status: string;

  @Column({
    nullable: true,
  })
  uscis_number: string;

  @Column({
    nullable: true,
  })
  work_license_expiry_date: Date;

  @Column({
    nullable: true,
  })
  i_94_number: string;

  @Column({
    nullable: true,
  })
  foreign_passport_number: string;

  @Column({
    nullable: true,
  })
  foreign_passport_issuing_country: string;

  @Column()
  owner: string;
  @OneToOne(() => User, (user) => user.id)
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
