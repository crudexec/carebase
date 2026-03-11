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

@Entity('snack_meal_time')
export class SnackMealTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  ate_all_meal_or_snack: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  ate_some_meal_or_snack: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  refused_all_meal_or_snack: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  drank_a_lot_of_water: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  drank_some_water: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  refused_all_water: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  drank_a_lot_of_juice: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  drank_some_juice: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  refused_all_juice: boolean;

  @Column({
    nullable: true,
  })
  specify_what_snack_or_meal_provided: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  prepared_snack_or_meal: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  served_snack_or_meal: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assisted_with_feeding: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  clean_up_after_snack_or_meal: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  specify_other: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  client_helped_to_clean_up_and_put_away_dishes: boolean;

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
