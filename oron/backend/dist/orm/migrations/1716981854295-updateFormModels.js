"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFormModels1716981854295 = void 0;
class updateFormModels1716981854295 {
    constructor() {
        this.name = 'updateFormModels1716981854295';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."reference_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "reference_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "referrer_one_firstname" character varying,
                "referrer_one_lastname" character varying,
                "referrer_one_email" character varying,
                "referrer_one_phone" character varying,
                "referrer_two_firstname" character varying,
                "referrer_two_lastname" character varying,
                "referrer_two_email" character varying,
                "referrer_two_phone" character varying,
                "referrer_three_firstname" character varying,
                "referrer_three_lastname" character varying,
                "referrer_three_email" character varying,
                "referrer_three_phone" character varying,
                "status" "public"."reference_form_status_enum" DEFAULT 'not_started',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_0e633ba568bf6394510a95280b" UNIQUE ("user_id"),
                CONSTRAINT "PK_ddf17e51206ef64d91c5fd793cd" PRIMARY KEY ("id")
            )
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
            ALTER TYPE "public"."user-bio-data_status_enum"
            RENAME TO "user-bio-data_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum" AS ENUM(
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
            ALTER TYPE "public"."flu_full_form_status_enum"
            RENAME TO "flu_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."employee_personal_information_status_enum"
            RENAME TO "employee_personal_information_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum" AS ENUM(
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
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum"
            RENAME TO "hepatitis_b_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."i9_form_status_enum"
            RENAME TO "i9_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."mmr_full_form_status_enum"
            RENAME TO "mmr_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."n95_fit_full_form_status_enum"
            RENAME TO "n95_fit_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."pneumococcal_full_form_status_enum"
            RENAME TO "pneumococcal_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum" AS ENUM(
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
            ALTER TYPE "public"."tuberculosis_full_form_status_enum"
            RENAME TO "tuberculosis_full_form_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum" AS ENUM(
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
                'approved'
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
        await queryRunner.query(`
            ALTER TABLE "reference_form"
            ADD CONSTRAINT "FK_0e633ba568bf6394510a95280bf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "reference_form" DROP CONSTRAINT "FK_0e633ba568bf6394510a95280bf"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."varicella_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."varicella_full_form_status_enum_old"
            RENAME TO "varicella_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."tuberculosis_full_form_status_enum_old"
            RENAME TO "tuberculosis_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."pneumococcal_full_form_status_enum_old"
            RENAME TO "pneumococcal_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."n95_fit_full_form_status_enum_old"
            RENAME TO "n95_fit_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."mmr_full_form_status_enum_old"
            RENAME TO "mmr_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."i9_form_status_enum_old"
            RENAME TO "i9_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum_old"
            RENAME TO "hepatitis_b_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."employee_personal_information_status_enum_old"
            RENAME TO "employee_personal_information_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."flu_full_form_status_enum_old"
            RENAME TO "flu_full_form_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum_old" AS ENUM('in_progress', 'awaiting_approval', 'approved')
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
            DROP TABLE "reference_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."reference_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updateFormModels1716981854295 = updateFormModels1716981854295;
//# sourceMappingURL=1716981854295-updateFormModels.js.map