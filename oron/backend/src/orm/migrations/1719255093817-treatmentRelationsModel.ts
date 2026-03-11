import { MigrationInterface, QueryRunner } from 'typeorm';

export class treatmentRelationsModel1719255093817 implements MigrationInterface {
  name = 'treatmentRelationsModel1719255093817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e"
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
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
  }
}
