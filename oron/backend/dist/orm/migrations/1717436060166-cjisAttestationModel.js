"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cjisAttestationModel1717436060166 = void 0;
class cjisAttestationModel1717436060166 {
    constructor() {
        this.name = 'cjisAttestationModel1717436060166';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            CREATE TABLE "cjis_employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "date_of_hire" TIMESTAMP,
                "employee_id" character varying,
                "job_title" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_3fde108497bd65244cfe75e27c" UNIQUE ("user_id"),
                CONSTRAINT "PK_c9a726c317701f6e956e61b5b5b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "cjis_signature_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "cjis_form_id" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_4e518f37763f0e3b2ab94b746a" UNIQUE ("signed_by"),
                CONSTRAINT "PK_fbcefc14033e1427635568c73a0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "first_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "last_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "date_of_hire"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "employee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "job_title"
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
            ALTER TABLE "cjis_employee_information"
            ADD "first_name" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "last_name" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "date_of_hire" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "employee_id" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "job_title" character varying
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
            ALTER TABLE "cjis_employee_information"
            ADD "signature_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "UQ_bf97e1f4fc9cc8070ebc1a9e4ea" UNIQUE ("signature_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."cjis_employee_information_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "status" "public"."cjis_employee_information_status_enum" NOT NULL DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
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
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "FK_3fde108497bd65244cfe75e27ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_signature_form"
            ADD CONSTRAINT "FK_4e518f37763f0e3b2ab94b746ac" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "FK_cf04ae7d81d8211e731fb1d9082" FOREIGN KEY ("employee_information_id") REFERENCES "cjis_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD CONSTRAINT "FK_bf97e1f4fc9cc8070ebc1a9e4ea" FOREIGN KEY ("signature_id") REFERENCES "cjis_signature_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "FK_bf97e1f4fc9cc8070ebc1a9e4ea"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "FK_cf04ae7d81d8211e731fb1d9082"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_signature_form" DROP CONSTRAINT "FK_4e518f37763f0e3b2ab94b746ac"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "FK_3fde108497bd65244cfe75e27ce"
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
            ALTER TABLE "cjis_employee_information" DROP COLUMN "review_notes"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."cjis_employee_information_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "UQ_bf97e1f4fc9cc8070ebc1a9e4ea"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "signature_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP CONSTRAINT "UQ_cf04ae7d81d8211e731fb1d9082"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "employee_information_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "job_title"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "employee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "date_of_hire"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "last_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information" DROP COLUMN "first_name"
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
            ADD "job_title" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "employee_id" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "date_of_hire" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "last_name" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cjis_employee_information"
            ADD "first_name" character varying NOT NULL
        `);
        await queryRunner.query(`
            DROP TABLE "cjis_signature_form"
        `);
        await queryRunner.query(`
            DROP TABLE "cjis_employee_information"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.cjisAttestationModel1717436060166 = cjisAttestationModel1717436060166;
//# sourceMappingURL=1717436060166-cjisAttestationModel.js.map