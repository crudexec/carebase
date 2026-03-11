import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTreatmentGoalIds1722431869498 implements MigrationInterface {
  name = 'updateTreatmentGoalIds1722431869498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5593336e376592b8f2c915a607c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
                RENAME COLUMN "treatment_goal_id" TO "treatment_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "treatment_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "treatment_goal_ids" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "treatment_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "treatment_goal_ids" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
                RENAME COLUMN "treatment_goal_ids" TO "treatment_goal_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5593336e376592b8f2c915a607c" FOREIGN KEY ("treatment_goal_id") REFERENCES "treatment_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
