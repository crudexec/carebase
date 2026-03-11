import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateIntakeAndTreatmentPlans1724697515312 implements MigrationInterface {
  name = 'updateIntakeAndTreatmentPlans1724697515312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "city" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "county" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "zip_code" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "address_or_street" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "apartment_number" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD "county" character varying
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."intake_full_form_status_enum"
            RENAME TO "intake_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."intake_full_form_status_enum" AS ENUM(
                'active',
                'inactive',
                'disengage',
                'not_admitted',
                'new_intake',
                'draft',
                'submitted'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status" TYPE "public"."intake_full_form_status_enum" USING "status"::"text"::"public"."intake_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'draft'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."intake_full_form_status_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."intake_full_form_status_enum_old" AS ENUM(
                'active',
                'disengage',
                'inactive',
                'new_intake',
                'not_admitted'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status" TYPE "public"."intake_full_form_status_enum_old" USING "status"::"text"::"public"."intake_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'new_intake'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."intake_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."intake_full_form_status_enum_old"
            RENAME TO "intake_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP COLUMN "county"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "address_or_street"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "zip_code"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "county"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "city"
        `);
  }
}
