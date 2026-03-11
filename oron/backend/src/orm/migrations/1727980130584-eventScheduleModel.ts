import { MigrationInterface, QueryRunner } from 'typeorm';

export class eventScheduleModel1727980130584 implements MigrationInterface {
  name = 'eventScheduleModel1727980130584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "event_approved" boolean NOT NULL DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "event_approved"
        `);
  }
}
