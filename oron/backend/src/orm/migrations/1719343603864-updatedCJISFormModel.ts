import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedCJISFormModel1719343603864 implements MigrationInterface {
  name = 'updatedCJISFormModel1719343603864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "cjis_pre_registration_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "pre_registration_pdf_url" character varying,
                "cjis_form_id" uuid,
                "user_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_9f5211bb74552e296ace515b0a" UNIQUE ("cjis_form_id"),
                CONSTRAINT "REL_043a3c8cbef60923ce929c56ed" UNIQUE ("user_id"),
                CONSTRAINT "PK_dec304b88753ee40facdb0c0a6b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD "pre_registration_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD CONSTRAINT "UQ_ac5a5174fc5b4b4d0d6ed47b097" UNIQUE ("pre_registration_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "FK_57552ccd29d31de72a8632e51e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "UQ_57552ccd29d31de72a8632e51e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5593336e376592b8f2c915a607c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "REL_5593336e376592b8f2c915a607"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_pre_registration_form"
            ADD CONSTRAINT "FK_9f5211bb74552e296ace515b0a2" FOREIGN KEY ("cjis_form_id") REFERENCES "cjis_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_pre_registration_form"
            ADD CONSTRAINT "FK_043a3c8cbef60923ce929c56ed5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD CONSTRAINT "FK_ac5a5174fc5b4b4d0d6ed47b097" FOREIGN KEY ("pre_registration_id") REFERENCES "cjis_pre_registration_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "FK_57552ccd29d31de72a8632e51e5" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5593336e376592b8f2c915a607c" FOREIGN KEY ("treatment_goal_id") REFERENCES "treatment_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5593336e376592b8f2c915a607c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "FK_57552ccd29d31de72a8632e51e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form" DROP CONSTRAINT "FK_ac5a5174fc5b4b4d0d6ed47b097"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_pre_registration_form" DROP CONSTRAINT "FK_043a3c8cbef60923ce929c56ed5"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_pre_registration_form" DROP CONSTRAINT "FK_9f5211bb74552e296ace515b0a2"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "REL_5593336e376592b8f2c915a607" UNIQUE ("treatment_goal_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5593336e376592b8f2c915a607c" FOREIGN KEY ("treatment_goal_id") REFERENCES "treatment_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "UQ_57552ccd29d31de72a8632e51e5" UNIQUE ("intake_full_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "FK_57552ccd29d31de72a8632e51e5" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form" DROP CONSTRAINT "UQ_ac5a5174fc5b4b4d0d6ed47b097"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form" DROP COLUMN "pre_registration_id"
        `);
    await queryRunner.query(`
            DROP TABLE "cjis_pre_registration_form"
        `);
  }
}
