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

import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';
import { Status } from 'types/genericEnums';

import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';

@Entity('play_leisure')
export class PlayLeisure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  puzzle: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  dance: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  arts_and_crafts: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  listen_to_music: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  icons_or_pictures: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  computer_games: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  short_naps: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_specify: string;

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
  treatment_plan_id: string;

  @ManyToOne(() => TreatmentFullPlan)
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentFullPlan: TreatmentFullPlan;

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
