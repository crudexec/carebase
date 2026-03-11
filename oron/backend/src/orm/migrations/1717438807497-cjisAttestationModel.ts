import { MigrationInterface, QueryRunner } from 'typeorm';

export class cjisAttestationModel1717438807497 implements MigrationInterface {
  name = 'cjisAttestationModel1717438807497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "FK_bf97e1f4fc9cc8070ebc1a9e4ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "FK_cf04ae7d81d8211e731fb1d9082"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."cjis_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "cjis_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employee_information_id" uuid,
                "signature_id" uuid,
                "status" "public"."cjis_full_form_status_enum" NOT NULL DEFAULT 'not_started',
                "review_notes" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_fc87b87d3ce75f1dd04fc80dce" UNIQUE ("employee_information_id"),
                CONSTRAINT "REL_9cc484981c5ff836f9771dfdbf" UNIQUE ("signature_id"),
                CONSTRAINT "REL_ebc8c668285f5587ae5fb551ec" UNIQUE ("user_id"),
                CONSTRAINT "PK_dd7d1a06b86646bca027bab68de" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "UQ_cf04ae7d81d8211e731fb1d9082"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "employee_information_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "UQ_bf97e1f4fc9cc8070ebc1a9e4ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "signature_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."cjis_employee_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "review_notes"
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
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
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
            ALTER TABLE "employee_handbook" DROP CONSTRAINT "FK_dd6a63de4bd7f4459a5a4de3c97"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_handbook"
            ALTER COLUMN "user_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_handbook"
            ADD CONSTRAINT "FK_dd6a63de4bd7f4459a5a4de3c97" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD CONSTRAINT "FK_fc87b87d3ce75f1dd04fc80dce6" FOREIGN KEY ("employee_information_id") REFERENCES "cjis_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD CONSTRAINT "FK_9cc484981c5ff836f9771dfdbf2" FOREIGN KEY ("signature_id") REFERENCES "cjis_signature_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ADD CONSTRAINT "FK_ebc8c668285f5587ae5fb551ec1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "cjis_full_form" DROP CONSTRAINT "FK_ebc8c668285f5587ae5fb551ec1"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form" DROP CONSTRAINT "FK_9cc484981c5ff836f9771dfdbf2"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form" DROP CONSTRAINT "FK_fc87b87d3ce75f1dd04fc80dce6"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_handbook" DROP CONSTRAINT "FK_dd6a63de4bd7f4459a5a4de3c97"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_handbook"
            ALTER COLUMN "user_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_handbook"
            ADD CONSTRAINT "FK_dd6a63de4bd7f4459a5a4de3c97" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ADD "work_phone_number" character varying
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
            ALTER TABLE "cjis_employee_information"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."cjis_employee_information_status_enum" AS ENUM(
                'approved',
                'awaiting_approval',
                'in_progress',
                'not_started',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "status" "public"."cjis_employee_information_status_enum" NOT NULL DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "signature_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "UQ_bf97e1f4fc9cc8070ebc1a9e4ea" UNIQUE ("signature_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "employee_information_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "UQ_cf04ae7d81d8211e731fb1d9082" UNIQUE ("employee_information_id")
        `);
    await queryRunner.query(`
            DROP TABLE "cjis_full_form"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."cjis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "FK_cf04ae7d81d8211e731fb1d9082" FOREIGN KEY ("employee_information_id") REFERENCES "cjis_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "FK_bf97e1f4fc9cc8070ebc1a9e4ea" FOREIGN KEY ("signature_id") REFERENCES "cjis_signature_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
