"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBiodataForm1728054036001 = void 0;
class updateBiodataForm1728054036001 {
    constructor() {
        this.name = 'updateBiodataForm1728054036001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "npi" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "lba" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "event_approved" DROP NOT NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "event_approved"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "lba"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "npi"
        `);
    }
}
exports.updateBiodataForm1728054036001 = updateBiodataForm1728054036001;
//# sourceMappingURL=1728054036001-updateBiodataForm.js.map