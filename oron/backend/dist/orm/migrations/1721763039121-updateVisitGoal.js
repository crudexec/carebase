"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitGoal1721763039121 = void 0;
class updateVisitGoal1721763039121 {
    constructor() {
        this.name = 'updateVisitGoal1721763039121';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
                RENAME COLUMN "visit_goal_id" TO "visit_goal_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "visit_goal_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "visit_goal_ids" text
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "visit_goal_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "visit_goal_ids" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
                RENAME COLUMN "visit_goal_ids" TO "visit_goal_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b" FOREIGN KEY ("visit_goal_id") REFERENCES "visit_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updateVisitGoal1721763039121 = updateVisitGoal1721763039121;
//# sourceMappingURL=1721763039121-updateVisitGoal.js.map