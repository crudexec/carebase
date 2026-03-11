import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateScheduleEvent1722442623562 implements MigrationInterface {
  name = 'updateScheduleEvent1722442623562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_3aa388e160038869926189c4c8e"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "REL_3aa388e160038869926189c4c8"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_3aa388e160038869926189c4c8e" FOREIGN KEY ("scheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_3aa388e160038869926189c4c8e"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "REL_3aa388e160038869926189c4c8" UNIQUE ("scheduled_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_3aa388e160038869926189c4c8e" FOREIGN KEY ("scheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
