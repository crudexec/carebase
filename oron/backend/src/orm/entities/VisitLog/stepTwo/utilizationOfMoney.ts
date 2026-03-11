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

@Entity('utilization_of_money')
export class UtilizationOfMoney {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  handing_bills_to_cashier: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  waiting_for_and_receiving_debit_credit_card: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  handing_coins_to_cashier: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  counting_the_change_to_make_sure_it_is_correct: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  handing_debit_credit_card_to_cashier: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  determining_and_handling_the_correct_estimated_amount: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  using_the_dollar_up_program: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  obtaining_and_reviewing_receipt_for_accuracy: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  waiting_for_and_accepting_the_change: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  this_activity_occured_at: string;

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
