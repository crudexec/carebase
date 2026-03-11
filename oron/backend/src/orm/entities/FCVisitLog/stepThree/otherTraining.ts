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
import { FcVisitFullForm } from '../fcVisitFullForm';

@Entity('fc_other_training')
export class FcOtherTraining {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication: string; // augmentative_comm_training

  @Column({
    nullable: true,
    type: 'text',
  })
  training_and_consultation_provided_on_communication_strategies: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  training_and_consultation_provided_on_behavior_intervention_strategies: string; // behavior_intervention_training

  @Column({
    nullable: true,
    type: 'text',
  })
  training_and_consultation_provided_on_safety_at_home_and_in_the_community: string; // safety_training

  @Column({
    nullable: true,
    type: 'text',
  })
  any_other_training_and_consultation_topics: string;

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

  @ManyToOne(() => FcVisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: FcVisitFullForm;

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
