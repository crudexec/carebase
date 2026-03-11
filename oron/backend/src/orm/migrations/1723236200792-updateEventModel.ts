import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateEventModel1723236200792 implements MigrationInterface {
  name = 'updateEventModel1723236200792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD "reschedule_approved" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_3b6748a12523bb060ce0237936f"
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "REL_3b6748a12523bb060ce0237936"
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_3b6748a12523bb060ce0237936f" FOREIGN KEY ("rescheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_3b6748a12523bb060ce0237936f"
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "REL_3b6748a12523bb060ce0237936" UNIQUE ("rescheduled_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_3b6748a12523bb060ce0237936f" FOREIGN KEY ("rescheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP COLUMN "reschedule_approved"
        `);
  }
}
