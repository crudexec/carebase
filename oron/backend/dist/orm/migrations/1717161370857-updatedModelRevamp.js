"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedModelRevamp1717161370857 = void 0;
class updatedModelRevamp1717161370857 {
    constructor() {
        this.name = 'updatedModelRevamp1717161370857';
    }
    async up(queryRunner) {
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
            ALTER TABLE "i9_form"
            ADD "filled_pdf_url" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ADD "user_id" uuid NOT NULL
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
            ALTER TABLE "reference_form"
            ADD "submitted_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "title" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "issuing_authority" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "document_number" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "file_url" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "expiration_date" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ADD CONSTRAINT "FK_bfca19dd247089f0626b5586a0c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "waiver_services" DROP CONSTRAINT "FK_bfca19dd247089f0626b5586a0c"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "expiration_date"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "file_url"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "document_number"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "issuing_authority"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ALTER COLUMN "title"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "reference_form" DROP COLUMN "submitted_at"
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
            ALTER TABLE "waiver_services" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP COLUMN "filled_pdf_url"
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
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updatedModelRevamp1717161370857 = updatedModelRevamp1717161370857;
//# sourceMappingURL=1717161370857-updatedModelRevamp.js.map