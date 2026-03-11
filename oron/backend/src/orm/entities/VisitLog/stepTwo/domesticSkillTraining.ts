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

import { Status } from 'types/genericEnums';

import { User } from '../../User';
import { VisitFullForm } from '../visitFullForm';
import { TreatmentFullPlan } from '../../TreatmentPlan/treatmentFullPlan';

@Entity('domestic_skill_training')
export class DomesticSkillTraining {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_make_bed: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_dust_furniture: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_vacuum: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_arrange_clothes: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_laundry: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_do_dishes: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_remove_trash: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_fold_clothes: boolean;

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

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_arrange_chairs: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_arrange_tables: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_turn_off_light: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_turn_off_computer: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  assist_to_arrange_bookshelves: boolean;

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
