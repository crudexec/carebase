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

@Entity('personal_work_reading')
export class PersonalWorkReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  grammar: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  writing_skills: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  vocabulary: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  reading_comprehension: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  algebra: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  geometry: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  measurement: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  number_operations: boolean;

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
    type: Boolean,
  })
  i_read_a_book_to_client: boolean;

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
