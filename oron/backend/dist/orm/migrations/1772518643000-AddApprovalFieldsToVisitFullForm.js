"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddApprovalFieldsToVisitFullForm1772518643000 = void 0;
class AddApprovalFieldsToVisitFullForm1772518643000 {
    constructor() {
        this.name = 'AddApprovalFieldsToVisitFullForm1772518643000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "approved_by" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "approved_at" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "review_notes" text
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_visit_full_form_approved_by"
            FOREIGN KEY ("approved_by")
            REFERENCES "users"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_visit_full_form_status"
            ON "visit_full_form" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_visit_full_form_approved_by"
            ON "visit_full_form" ("approved_by")
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "IDX_visit_full_form_approved_by"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_visit_full_form_status"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP CONSTRAINT "FK_visit_full_form_approved_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "review_notes"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "approved_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "approved_by"
        `);
    }
}
exports.AddApprovalFieldsToVisitFullForm1772518643000 = AddApprovalFieldsToVisitFullForm1772518643000;
//# sourceMappingURL=1772518643000-AddApprovalFieldsToVisitFullForm.js.map