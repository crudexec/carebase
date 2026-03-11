import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';
import { Status } from 'types/genericEnums';

import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';

@Entity('communication')
export class Communication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  gestures: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  written_words: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  picture_communication_symbols: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  objects: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  short_phrases: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  repetitive_phrases: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  icons_pictures: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  verbal_sounds: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  type_words: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  single_words: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  photographs: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  sign_language: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  an_augmentative_communication_device: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  picture_exchange_communication_system: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_description: string;

  @Column({
    nullable: true,
  })
  treatment_plan_id: string;
  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentFullPlan: TreatmentFullPlan;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    nullable: true,
  })
  account_id: string;

  @Column({
    nullable: true,
  })
  visit_full_form_id: string;
  @ManyToOne(() => VisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: VisitFullForm;

  @Column({
    nullable: true,
  })
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
