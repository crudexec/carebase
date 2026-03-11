import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IntakeFullForm } from '../IntakeForm/intakeFullForm';

@Entity('specific_needs_authorization')
export class Authorization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  creator_name: string;

  @Column({ type: 'boolean', default: false })
  signature_confirmation: boolean;

  @Column({ nullable: true })
  signature_url: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @Column({
    nullable: true,
  })
  intake_full_id: string;
  @ManyToOne(() => IntakeFullForm)
  @JoinColumn({ name: 'intake_full_id' })
  intakeFullForm: IntakeFullForm;
}
