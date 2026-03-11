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

@Entity('mother_contact_information')
export class MotherContactInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  first_name: string;

  @Column({
    nullable: true,
  })
  last_name: string;

  @Column({
    nullable: true,
  })
  relationship: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  street_number_and_house_address: string;

  @Column({
    nullable: true,
  })
  country: string;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  zip_code: string;

  @Column({
    nullable: true,
  })
  apartment_number: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  home_phone_number: string;

  @Column({
    nullable: true,
  })
  work_phone_number: string;

  @Column()
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
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
