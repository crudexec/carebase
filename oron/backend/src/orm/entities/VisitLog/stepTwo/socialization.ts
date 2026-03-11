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

@Entity('socialization')
export class Socialization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  birthday_party: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  communication_session: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  social_group: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  music_dance_group: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_social_setting: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  specify_other_social_setting: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  play_at_the_park: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  basketball: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  watch_movie: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  bowling: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  swimming: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_recreation: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  specify_other_recreation: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  visit_to_the_library: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  visit_to_the_museum: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  visit_to_the_zoo: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  visit_to_the_shopping_mall: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  visit_to_the_post_office: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_community_integration: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  specify_other_community_integration: string;

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
