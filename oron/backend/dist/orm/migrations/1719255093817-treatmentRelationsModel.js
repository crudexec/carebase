"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatmentRelationsModel1719255093817 = void 0;
class treatmentRelationsModel1719255093817 {
    constructor() {
        this.name = 'treatmentRelationsModel1719255093817';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "UQ_d00acf1aae053f610f8ea260c7e" UNIQUE ("intake_full_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_d00acf1aae053f610f8ea260c7e" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    }
}
exports.treatmentRelationsModel1719255093817 = treatmentRelationsModel1719255093817;
//# sourceMappingURL=1719255093817-treatmentRelationsModel.js.map