"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitModel1721229220470 = void 0;
class updateVisitModel1721229220470 {
    constructor() {
        this.name = 'updateVisitModel1721229220470';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "start_time" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "intake_full_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "end_time" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_f6c7dfac0430e46ec7cb1411b33" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_f6c7dfac0430e46ec7cb1411b33"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "end_time"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "intake_full_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "start_time"
        `);
    }
}
exports.updateVisitModel1721229220470 = updateVisitModel1721229220470;
//# sourceMappingURL=1721229220470-updateVisitModel.js.map