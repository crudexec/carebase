"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModels1717015170620 = void 0;
class updateModels1717015170620 {
    constructor() {
        this.name = 'updateModels1717015170620';
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
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
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
exports.updateModels1717015170620 = updateModels1717015170620;
//# sourceMappingURL=1717015170620-updateModels.js.map