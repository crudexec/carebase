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

import { Gender, Ethnicity } from 'types/genericEnums';

import { User } from '../User';

@Entity('client_information')
export class ClientInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    nullable: true,
  })
  date_of_birth: Date;

  @Column({
    nullable: true,
  })
  state: string;

  @Column({
    nullable: true,
    enum: Gender,
  })
  sex: Gender;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Ethnicity,
  })
  race_or_ethinicity: Ethnicity;

  @Column({
    nullable: true,
  })
  country: string;

  @Column({
    nullable: true,
    length: 9,
  })
  social_security_number: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  county: string;

  @Column({
    nullable: true,
  })
  zip_code: string;

  @Column({
    nullable: true,
  })
  address_or_street: string;

  @Column({
    nullable: true,
  })
  apartment_number: string;

  @Column({
    nullable: true,
  })
  medicaid_number: string;

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
