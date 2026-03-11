import { MigrationInterface, QueryRunner } from 'typeorm';

export class newI9Updates1717787251654 implements MigrationInterface {
  name = 'newI9Updates1717787251654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
                RENAME COLUMN "filled_pdf_url" TO "filled_pdf_json_data"
        `);
    await queryRunner.query(`
            CREATE TABLE "company_account" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying DEFAULT 'creed',
                "account_id" character varying DEFAULT 'creed',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_6a56c16291e3654a159998f621b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "account_id" character varying DEFAULT 'creed'
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d" UNIQUE ("employee_personal_information_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form" DROP COLUMN "filled_pdf_json_data"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD "filled_pdf_json_data" text
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP COLUMN "familiar_communication_modes"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."more_about_information_familiar_communication_modes_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ADD "familiar_communication_modes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP COLUMN "familiar_communication_modes"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_familiar_communication_modes_enum" AS ENUM('Non_Verbal', 'PECS', 'Sign_Language', 'Verbal')
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ADD "familiar_communication_modes" "public"."more_about_information_familiar_communication_modes_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form" DROP COLUMN "filled_pdf_json_data"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD "filled_pdf_json_data" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "account_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d" UNIQUE ("employee_personal_information_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
    await queryRunner.query(`
            DROP TABLE "company_account"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
                RENAME COLUMN "filled_pdf_json_data" TO "filled_pdf_url"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
