import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { SpecificNeedsBasicInformation } from './BasicInformation';
import { ServiceNeeds } from './ServiceNeeds';
import { CurrentNeedOrSupport } from './CurrentNeedOrSupport';
import { Authorization } from './Authorization';
import { IntakeFullForm } from '../IntakeForm/intakeFullForm';
import { Status } from 'types/genericEnums';
import { User } from '../User';

@Entity('specific_needs_full_form')
export class SpecificNeedsFullForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  basic_information_id: string;
  @ManyToOne(() => SpecificNeedsBasicInformation)
  @JoinColumn({ name: 'basic_information_id' })
  basicInformation: SpecificNeedsBasicInformation;

  @Column({
    nullable: true,
  })
  service_needs_id: string;
  @ManyToOne(() => ServiceNeeds)
  @JoinColumn({ name: 'service_needs_id' })
  serviceNeeds: ServiceNeeds;

  @Column({
    nullable: true,
  })
  current_need_or_support_id: string;
  @ManyToOne(() => CurrentNeedOrSupport)
  @JoinColumn({ name: 'current_need_or_support_id' })
  currentNeedOrSupport: CurrentNeedOrSupport;

  @Column({
    nullable: true,
  })
  authorization_id: string;
  @ManyToOne(() => Authorization)
  @JoinColumn({ name: 'authorization_id' })
  authorization: Authorization;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @Column()
  registered_by: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  user: User;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deleted_at: Date;
}
