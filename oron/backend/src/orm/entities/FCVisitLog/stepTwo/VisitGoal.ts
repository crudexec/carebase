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

@Entity('fc_visit_goal')
export class FcVisitGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  short_term_objective: string;

  @Column({
    nullable: true,
    type: 'simple-array',
  })
  family_members_goal_discussed_with: string[];

  @Column('simple-json', { nullable: true })
  current_teaching_methods_or_strategies: {
    current_teaching_methods: string;
    discussed_at_fc_session: string;
  }[];

  @Column({
    nullable: true,
    type: 'text',
  })
  parent_or_family_members_challenges_when_implementing_strategies: string; // family_implementation_challenges

  @Column({
    nullable: true,
    type: 'text',
  })
  training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies: string; // family_strategy_training

  @Column({
    nullable: true,
    type: 'text',
  })
  additional_comments: string;

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

  @ManyToOne(() => FcVisitFullForm)
  @JoinColumn({ name: 'visit_full_form_id' })
  visitFullForm: FcVisitFullForm;

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
