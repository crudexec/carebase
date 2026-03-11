import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../User';

@Entity('flu_attestation_form')
export class FluAttestationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  have_received_flu_vaccine: boolean;

  @Column({
    nullable: true,
  })
  date_received_flu_vaccine: Date;

  @Column({
    nullable: true,
  })
  vaccination_site: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  received_flu_vaccine_elsewhere: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  medical_contraindication_to_receiving_vaccine: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  personal_or_religious_beliefs_preventing_vaccination: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  allergic_to_vaccine_components: boolean;

  @Column({
    nullable: true,
    type: Boolean,
  })
  concerns_about_vaccine_safety: boolean;

  @Column({
    nullable: true,
    type: 'text',
  })
  other: string;

  @Column({
    nullable: true,
    type: Boolean,
  })
  declined_flu_vaccine: boolean;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
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
