import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateIntakeAndTreatment1718914048512 implements MigrationInterface {
  name = 'updateIntakeAndTreatment1718914048512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD "intake_full_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "UQ_f26327c6a457ad80d44f34c6198" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD "intake_full_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "UQ_57552ccd29d31de72a8632e51e5" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD "time_slot" text
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD "intake_full_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "UQ_e000edd7f9b94bd7c972feb7ea2" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "intake_full_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "FK_f26327c6a457ad80d44f34c6198" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "FK_57552ccd29d31de72a8632e51e5" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "FK_57552ccd29d31de72a8632e51e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "FK_f26327c6a457ad80d44f34c6198"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "intake_full_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "UQ_e000edd7f9b94bd7c972feb7ea2"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP COLUMN "intake_full_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP COLUMN "time_slot"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "UQ_57552ccd29d31de72a8632e51e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP COLUMN "intake_full_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "UQ_f26327c6a457ad80d44f34c6198"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP COLUMN "intake_full_id"
        `);
  }
}
