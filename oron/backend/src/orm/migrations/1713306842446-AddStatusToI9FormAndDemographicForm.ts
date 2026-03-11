import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToI9FormAndDemographicForm1713306842446 implements MigrationInterface {
  name = 'AddStatusToI9FormAndDemographicForm1713306842446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "mmr_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "status" "public"."user-bio-data_status_enum" NOT NULL DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD "status" "public"."employee_personal_information_status_enum" NOT NULL DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_d601c59d870a161d2232e05a550" UNIQUE ("flu_form_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD "status" "public"."i9_form_status_enum" NOT NULL DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "mmr_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8" UNIQUE ("mmr_form_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "mmr_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_d601c59d870a161d2232e05a550" UNIQUE ("flu_form_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "mmr_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8" UNIQUE ("mmr_form_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
