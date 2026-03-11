import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateClientStaffAssignment1772727000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create client_staff_assignments table
    await queryRunner.createTable(
      new Table({
        name: "client_staff_assignments",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "client_id",
            type: "uuid",
          },
          {
            name: "staff_id",
            type: "uuid",
          },
          {
            name: "assigned_by",
            type: "uuid",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      "client_staff_assignments",
      new TableForeignKey({
        columnNames: ["client_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "intake_full_form",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "client_staff_assignments",
      new TableForeignKey({
        columnNames: ["staff_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "client_staff_assignments",
      new TableForeignKey({
        columnNames: ["assigned_by"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
      })
    );

    // Create client_staff_assignment_history table
    await queryRunner.createTable(
      new Table({
        name: "client_staff_assignment_history",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "client_id",
            type: "uuid",
          },
          {
            name: "staff_id",
            type: "uuid",
          },
          {
            name: "action_by",
            type: "uuid",
          },
          {
            name: "action",
            type: "enum",
            enum: ["assigned", "unassigned"],
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Add foreign keys for history table
    await queryRunner.createForeignKey(
      "client_staff_assignment_history",
      new TableForeignKey({
        columnNames: ["client_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "intake_full_form",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "client_staff_assignment_history",
      new TableForeignKey({
        columnNames: ["staff_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "client_staff_assignment_history",
      new TableForeignKey({
        columnNames: ["action_by"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
      })
    );

    // Add indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX idx_client_staff_assignments_client_id ON client_staff_assignments(client_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_client_staff_assignments_staff_id ON client_staff_assignments(staff_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_client_staff_assignments_active ON client_staff_assignments(is_active)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_client_staff_assignment_history_client_id ON client_staff_assignment_history(client_id)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("client_staff_assignment_history");
    await queryRunner.dropTable("client_staff_assignments");
  }
}
