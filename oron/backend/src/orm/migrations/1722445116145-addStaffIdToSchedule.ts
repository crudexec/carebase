import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStaffIdToSchedule1722445116145 implements MigrationInterface {
  name = 'addStaffIdToSchedule1722445116145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "employee_or_staff_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_7808dce60984b93563c1aaf95e5" FOREIGN KEY ("employee_or_staff_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_7808dce60984b93563c1aaf95e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "employee_or_staff_id"
        `);
  }
}
