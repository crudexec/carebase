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

import { User } from '../User';

enum jobPosition {
  'DSP (Direct Care Worker)' = 'DSP (Direct Care Worker)',
  'On-Call Professional' = 'On-Call Professional',
  'Family Consultant' = 'Family Consultant',
  'Intensive Individual Support Services (IISS)' = 'Intensive Individual Support Services(IISS)',
}

@Entity('offer_letter')
export class OfferLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  full_name: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: jobPosition,
  })
  job_position: jobPosition;

  @Column({
    nullable: true,
  })
  signature: string;

  @Column({
    nullable: true,
    type: Boolean,
    default: false,
  })
  signed: boolean;

  @Column()
  user_id: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: true,
  })
  offer_letter_pdf_url: string;

  @Column()
  @CreateDateColumn()
  offer_date: Date;

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
