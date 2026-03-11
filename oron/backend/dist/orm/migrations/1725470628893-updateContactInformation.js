"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactInformation1725470628893 = void 0;
class updateContactInformation1725470628893 {
    constructor() {
        this.name = 'updateContactInformation1725470628893';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "first_name" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "last_name" DROP NOT NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "last_name"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "first_name"
            SET NOT NULL
        `);
    }
}
exports.updateContactInformation1725470628893 = updateContactInformation1725470628893;
//# sourceMappingURL=1725470628893-updateContactInformation.js.map