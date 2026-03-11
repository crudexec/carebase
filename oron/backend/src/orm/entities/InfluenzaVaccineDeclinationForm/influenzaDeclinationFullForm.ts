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

import { Status } from 'types/genericEnums';

import { User } from '../User';

import { InfluenzaVaccinationDeclinationForm } from './declinationInfluenzaForm';
import { InfluenzaEmployeeInformation } from './personalInformation';
import { InfluenzaSignatureForm } from './signatureForm';

@Entity('influenza_vaccination_declination_full_form')
export class InfluenzaVaccinationDeclinationFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  personal_information_id: string;
  @OneToOne(() => InfluenzaEmployeeInformation, (form) => form.id)
  @JoinColumn({ name: 'personal_information_id' })
  personal_information: InfluenzaEmployeeInformation;

  @Column({
    nullable: true,
  })
  declination_id: string;
  @OneToOne(() => InfluenzaVaccinationDeclinationForm, (form) => form.id)
  @JoinColumn({ name: 'declination_id' })
  declination: InfluenzaVaccinationDeclinationForm;

  @Column({
    nullable: true,
  })
  signature_id: string;
  @OneToOne(() => InfluenzaSignatureForm, (form) => form.id)
  @JoinColumn({ name: 'signature_id' })
  signature: InfluenzaSignatureForm;

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
