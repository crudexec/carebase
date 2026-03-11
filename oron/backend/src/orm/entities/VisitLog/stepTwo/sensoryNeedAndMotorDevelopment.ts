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

@Entity('sensory_need_and_motor_development')
export class SensoryNeedAndMotorDevelopment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  paste_objects: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  copy_simple_shapes: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  turn_pages_of_book: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  button_a_shirt: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  use_of_cutlery: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  cut_simple_shapes: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  use_pencil_and_crayons_well: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  zip_a_zipper: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  handle_scissors_well: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  play_musical_instruments: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  match_simple_objects: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  complete_simple_puzzles: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  build_with_blocks: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_error_motor_development_skills: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_error_specify_motor_development_skills: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  throw_a_ball: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  kick_using_balls: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  roll_balls_with_hand_or_foot: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  skip_in_circles: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  hang_clothes: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  go_down_slides: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  climb_ladders: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  walk_a_straight_line: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  jump_rope: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  run_around_objects: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  toss_a_ball: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  walk_backwards: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  balance_on_one_foot: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  going_up_and_down_steps: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  pump_legs_on_the_swing_at_a_playground: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  other_gross_motor_skills: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_specify_gross_motor_skills: string;

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
