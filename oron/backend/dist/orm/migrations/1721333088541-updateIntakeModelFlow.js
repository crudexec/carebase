"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIntakeModelFlow1721333088541 = void 0;
class updateIntakeModelFlow1721333088541 {
    constructor() {
        this.name = 'updateIntakeModelFlow1721333088541';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "first_name" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "last_name" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "account_id" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "account_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "last_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "first_name"
        `);
    }
}
exports.updateIntakeModelFlow1721333088541 = updateIntakeModelFlow1721333088541;
//# sourceMappingURL=1721333088541-updateIntakeModelFlow.js.map