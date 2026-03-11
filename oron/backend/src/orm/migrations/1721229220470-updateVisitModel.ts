import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitModel1721229220470 implements MigrationInterface {
  name = 'updateVisitModel1721229220470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "start_time" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "intake_full_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "end_time" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_f6c7dfac0430e46ec7cb1411b33" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_f6c7dfac0430e46ec7cb1411b33"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "end_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "intake_full_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "start_time"
        `);
  }
}
