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

import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { TreatmentFullPlan } from '../TreatmentPlan/treatmentFullPlan';
import { Status, TreatmentPlanType } from 'types/genericEnums';

import { User } from '../User';

import { Communication } from './stepOne/communication';
import { ConcernAndChallenges } from './stepOne/concernAndChallenges';
import { SelfManagement } from './stepOne/selfManagement';
import { SessionHighlights } from './stepOne/sessionHighlights';
import { DomesticSkillTraining } from './stepTwo/domesticSkillTraining';
import { PersonalCareAndBladderControl } from './stepTwo/personalCareAndControl';
import { PersonalWorkReading } from './stepTwo/personalWorkReading';
import { PlayLeisure } from './stepTwo/playLeisure';
import { SafetyAndSurvivalSkills } from './stepTwo/safetyAndSurvivalSkills';
import { SensoryNeedAndMotorDevelopment } from './stepTwo/sensoryNeedAndMotorDevelopment';
import { SnackMealTime } from './stepTwo/snackMealTime';
import { Socialization } from './stepTwo/socialization';
import { UtilizationOfMoney } from './stepTwo/utilizationOfMoney';
import { TransportationTypeAndObjectives } from './stepOne/transportationTypeAndObjectives';

@Entity('visit_full_form')
export class VisitFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  session_highlights_id: string;
  @ManyToOne(() => SessionHighlights)
  @JoinColumn({ name: 'session_highlights_id' })
  sessionHighlights: SessionHighlights;

  @Column({
    nullable: true,
  })
  self_management_id: string;
  @ManyToOne(() => SelfManagement)
  @JoinColumn({ name: 'self_management_id' })
  selfManagement: SelfManagement;

  @Column({
    nullable: true,
  })
  communication_id: string;
  @ManyToOne(() => Communication)
  @JoinColumn({ name: 'communication_id' })
  communication: Communication;

  @Column('simple-array', { nullable: true })
  behavior_management_ids: string[];

  @Column({
    nullable: true,
  })
  concern_and_challenges_id: string;
  @ManyToOne(() => ConcernAndChallenges)
  @JoinColumn({ name: 'concern_and_challenges_id' })
  concernAndChallenges: ConcernAndChallenges;

  @Column({
    nullable: true,
  })
  domestic_skill_training_id: string;
  @ManyToOne('DomesticSkillTraining')
  @JoinColumn({ name: 'domestic_skill_training_id' })
  domesticSkillTraining: DomesticSkillTraining;

  @Column({
    nullable: true,
  })
  play_leisure_id: string;
  @ManyToOne(() => PlayLeisure)
  @JoinColumn({ name: 'play_leisure_id' })
  playLeisure: PlayLeisure;

  @Column({
    nullable: true,
  })
  snack_meal_time_id: string;
  @ManyToOne(() => SnackMealTime)
  @JoinColumn({ name: 'snack_meal_time_id' })
  snackMealTime: SnackMealTime;

  @Column({
    nullable: true,
  })
  utilization_of_money_id: string;
  @ManyToOne(() => UtilizationOfMoney)
  @JoinColumn({ name: 'utilization_of_money_id' })
  utilizationOfMoney: UtilizationOfMoney;

  @Column({
    nullable: true,
  })
  socialization_id: string;
  @ManyToOne(() => Socialization)
  @JoinColumn({ name: 'socialization_id' })
  socialization: Socialization;

  @Column({
    nullable: true,
  })
  safety_and_survival_skills_id: string;
  @ManyToOne(() => SafetyAndSurvivalSkills)
  @JoinColumn({ name: 'safety_and_survival_skills_id' })
  safetyAndSurvivalSkills: SafetyAndSurvivalSkills;

  @Column({
    nullable: true,
  })
  personal_care_and_bladder_control_id: string;
  @ManyToOne(() => PersonalCareAndBladderControl)
  @JoinColumn({ name: 'personal_care_and_bladder_control_id' })
  personalCareAndBladderControl: PersonalCareAndBladderControl;

  @Column({
    nullable: true,
  })
  sensory_need_and_motor_development_id: string;
  @ManyToOne(
    () => SensoryNeedAndMotorDevelopment,
    (sensoryNeedAndMotorDevelopment) => sensoryNeedAndMotorDevelopment.id,
  )
  @JoinColumn({ name: 'sensory_need_and_motor_development_id' })
  sensoryNeedAndMotorDevelopment: SensoryNeedAndMotorDevelopment;

  @Column({
    nullable: true,
  })
  personal_work_reading_id: string;
  @ManyToOne(() => PersonalWorkReading)
  @JoinColumn({ name: 'personal_work_reading_id' })
  personalWorkReading: PersonalWorkReading;

  @Column({
    nullable: true,
  })
  transportation_type_and_objectives_id: string;
  @ManyToOne(
    () => TransportationTypeAndObjectives,
    (transportationTypeAndObjectives) => transportationTypeAndObjectives.id,
  )
  @JoinColumn({ name: 'transportation_type_and_objectives_id' })
  transportationTypeAndObjectives: TransportationTypeAndObjectives;

  @Column('simple-array', { nullable: true })
  visit_goal_ids: string[];

  @Column({
    nullable: true,
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
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
    type: 'enum',
    enum: TreatmentPlanType,
    default: TreatmentPlanType.IISS_ASSESSMENT,
  })
  treatment_type: TreatmentPlanType;

  @Column({
    nullable: true,
  })
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  approved_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({
    nullable: true,
  })
  approved_at: Date;

  @Column({
    nullable: true,
    type: 'text',
  })
  review_notes: string;

  @Column({
    nullable: true,
  })
  date_of_visit: Date;

  @Column({
    nullable: true,
  })
  start_time: string;

  @Column({
    nullable: true,
  })
  intake_full_id: string;

  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

  @Column({
    nullable: true,
  })
  end_time: string;

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
