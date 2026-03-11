"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParentTreatmentPlanSignature1729113487802 = void 0;
class UpdateParentTreatmentPlanSignature1729113487802 {
    constructor() {
        this.name = 'UpdateParentTreatmentPlanSignature1729113487802';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "parent_name" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "parent_email" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "relation_to_participant" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "parent_email_sent" boolean DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD "parent_signature_url" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD "parent_signed" boolean DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD "date_parent_signed" TIMESTAMP
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP COLUMN "date_parent_signed"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP COLUMN "parent_signed"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP COLUMN "parent_signature_url"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "parent_email_sent"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "relation_to_participant"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "parent_email"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "parent_name"
        `);
    }
}
exports.UpdateParentTreatmentPlanSignature1729113487802 = UpdateParentTreatmentPlanSignature1729113487802;
//# sourceMappingURL=1729113487802-UpdateParentTreatmentPlanSignature.js.map