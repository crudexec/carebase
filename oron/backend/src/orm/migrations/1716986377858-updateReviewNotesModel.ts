import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateReviewNotesModel1716986377858 implements MigrationInterface {
  name = 'updateReviewNotesModel1716986377858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
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
            ALTER TABLE "user-bio-data"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ADD "review_notes" text
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
            ALTER TABLE "hepatitis_b_full_form"
            ADD "review_notes" text
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
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ADD "review_notes" text
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user-bio-data_status_enum"
            RENAME TO "user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" TYPE "public"."user-bio-data_status_enum" USING "status"::"text"::"public"."user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."employee_personal_information_status_enum"
            RENAME TO "employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" TYPE "public"."employee_personal_information_status_enum" USING "status"::"text"::"public"."employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."flu_full_form_status_enum"
            RENAME TO "flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" TYPE "public"."flu_full_form_status_enum" USING "status"::"text"::"public"."flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum"
            RENAME TO "hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" TYPE "public"."hepatitis_b_full_form_status_enum" USING "status"::"text"::"public"."hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" TYPE "public"."influenza_vaccination_declination_full_form_status_enum" USING "status"::"text"::"public"."influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."i9_form_status_enum"
            RENAME TO "i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" TYPE "public"."i9_form_status_enum" USING "status"::"text"::"public"."i9_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."mmr_full_form_status_enum"
            RENAME TO "mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" TYPE "public"."mmr_full_form_status_enum" USING "status"::"text"::"public"."mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."pneumococcal_full_form_status_enum"
            RENAME TO "pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" TYPE "public"."pneumococcal_full_form_status_enum" USING "status"::"text"::"public"."pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."n95_fit_full_form_status_enum"
            RENAME TO "n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" TYPE "public"."n95_fit_full_form_status_enum" USING "status"::"text"::"public"."n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."reference_form_status_enum"
            RENAME TO "reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."reference_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" TYPE "public"."reference_form_status_enum" USING "status"::"text"::"public"."reference_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."tuberculosis_full_form_status_enum"
            RENAME TO "tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" TYPE "public"."tuberculosis_full_form_status_enum" USING "status"::"text"::"public"."tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."varicella_full_form_status_enum"
            RENAME TO "varicella_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."varicella_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" TYPE "public"."varicella_full_form_status_enum" USING "status"::"text"::"public"."varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum_old"
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
            CREATE TYPE "public"."varicella_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" TYPE "public"."varicella_full_form_status_enum_old" USING "status"::"text"::"public"."varicella_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."varicella_full_form_status_enum_old"
            RENAME TO "varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" TYPE "public"."tuberculosis_full_form_status_enum_old" USING "status"::"text"::"public"."tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."tuberculosis_full_form_status_enum_old"
            RENAME TO "tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."reference_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" TYPE "public"."reference_form_status_enum_old" USING "status"::"text"::"public"."reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."reference_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."reference_form_status_enum_old"
            RENAME TO "reference_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" TYPE "public"."n95_fit_full_form_status_enum_old" USING "status"::"text"::"public"."n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."n95_fit_full_form_status_enum_old"
            RENAME TO "n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" TYPE "public"."pneumococcal_full_form_status_enum_old" USING "status"::"text"::"public"."pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."pneumococcal_full_form_status_enum_old"
            RENAME TO "pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" TYPE "public"."mmr_full_form_status_enum_old" USING "status"::"text"::"public"."mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."mmr_full_form_status_enum_old"
            RENAME TO "mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" TYPE "public"."i9_form_status_enum_old" USING "status"::"text"::"public"."i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."i9_form_status_enum_old"
            RENAME TO "i9_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old" USING "status"::"text"::"public"."influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" TYPE "public"."hepatitis_b_full_form_status_enum_old" USING "status"::"text"::"public"."hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum_old"
            RENAME TO "hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" TYPE "public"."flu_full_form_status_enum_old" USING "status"::"text"::"public"."flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."flu_full_form_status_enum_old"
            RENAME TO "flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" TYPE "public"."employee_personal_information_status_enum_old" USING "status"::"text"::"public"."employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."employee_personal_information_status_enum_old"
            RENAME TO "employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" TYPE "public"."user-bio-data_status_enum_old" USING "status"::"text"::"public"."user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user-bio-data_status_enum_old"
            RENAME TO "user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form" DROP COLUMN "review_notes"
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
            ALTER TABLE "hepatitis_b_full_form" DROP COLUMN "review_notes"
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
            ALTER TABLE "flu_full_form" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "review_notes"
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
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
