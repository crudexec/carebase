import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { IntakeFullForm } from "./IntakeForm/intakeFullForm";

export enum AssignmentAction {
  ASSIGNED = "assigned",
  UNASSIGNED = "unassigned",
}

@Entity({ name: "client_staff_assignment_history" })
export class ClientStaffAssignmentHistory {
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
  action_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "action_by" })
  actionBy: User;

  @Column({
    type: "enum",
    enum: AssignmentAction,
  })
  action: AssignmentAction;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}
