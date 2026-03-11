import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { IntakeFullForm } from "./IntakeForm/intakeFullForm";

@Entity({ name: "client_staff_assignments" })
export class ClientStaffAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  client_id: string;

  @ManyToOne(() => IntakeFullForm, { onDelete: "CASCADE" })
  @JoinColumn({ name: "client_id" })
  client: IntakeFullForm;

  @Column({ type: "uuid" })
  staff_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "staff_id" })
  staff: User;

  @Column({ type: "uuid" })
  assigned_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assignedBy: User;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "timestamp", nullable: true })
  deleted_at: Date | null;
}
