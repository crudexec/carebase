"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitGoalObjectives1721861371140 = void 0;
class updateVisitGoalObjectives1721861371140 {
    constructor() {
        this.name = 'updateVisitGoalObjectives1721861371140';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "goal_background" text
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "short_term_objective" text
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "short_term_objective"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "goal_background"
        `);
    }
}
exports.updateVisitGoalObjectives1721861371140 = updateVisitGoalObjectives1721861371140;
//# sourceMappingURL=1721861371140-updateVisitGoalObjectives.js.map