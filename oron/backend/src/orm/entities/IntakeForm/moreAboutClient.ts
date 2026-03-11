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

import { Gender } from 'types/genericEnums';

import { User } from '../User';

enum CommunicationModes {
  Verbal = 'Verbal',
  Non_Verbal = 'Non_Verbal',
  Sign_Language = 'Sign_Language',
  PECS = 'PECS',
}

enum Toileting {
  Toilet_Trained = 'Toilet_Trained',
  Not_Toilet_Trained = 'Not_Toilet_Trained',
  Toilet_Trained_But_Requires_Supervision = 'Toilet_Trained_But_Requires_Supervision',
}

enum DocumentProvided {
  IEP = 'IEP',
  Behavior_Plan = 'Behavior_Plan',
  Psychological_Evaluation = 'Psychological_Evaluation',
}

@Entity('more_about_information')
export class MoreAboutInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  things_I_can_do_by_myself: string;

  @Column({
    nullable: true,
  })
  things_I_need_help_with: string;

  @Column({
    nullable: true,
  })
  new_skills_I_want_to_learn: string;

  @Column({
    nullable: true,
  })
  my_hobbies: string;

  @Column({
    nullable: true,
  })
  favorite_food_and_snacks: string;

  @Column({
    nullable: true,
  })
  what_makes_me_mad: string;

  @Column({
    nullable: true,
  })
  behaviors_I_sometimes_Display: string;

  @Column({
    nullable: true,
  })
  ways_my_behaviors_can_be_managed: string;

  @Column({
    nullable: true,
  })
  my_house_rules: string;

  @Column({
    nullable: true,
    type: 'simple-array',
  })
  familiar_communication_modes: CommunicationModes[];

  @Column({
    nullable: true,
    type: Boolean,
  })
  can_be_transported_alone: boolean;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Toileting,
  })
  toileting: Toileting;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Gender,
  })
  cared_for_by: Gender;

  @Column({
    nullable: true,
    type: 'enum',
    enum: DocumentProvided,
  })
  document_provided_during_intake: DocumentProvided;

  @Column({
    nullable: true,
  })
  good_performance_reward: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  other_comments: string;

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
