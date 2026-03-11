import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserStatus1772736906000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for user status
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'DISENGAGED')
    `);

    // Add status column to users table with default value
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "status",
        type: "user_status_enum",
        default: "'ACTIVE'",
        isNullable: false,
      })
    );

    // Set all existing users to ACTIVE status
    await queryRunner.query(`
      UPDATE users SET status = 'ACTIVE' WHERE status IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the status column
    await queryRunner.dropColumn("users", "status");

    // Drop the enum type
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
  }
}
