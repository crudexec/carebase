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

export interface NeedDetail {
  current_need_details?: string;
  description: string;
  specificNeeds: string[];
  recommendation?: string;
}

@Entity('specific_needs_current_need_or_support')
export class CurrentNeedOrSupport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  current_needs: NeedDetail[];

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;

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
