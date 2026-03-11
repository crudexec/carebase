"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBehaviorManagement1723227311688 = void 0;
class updateBehaviorManagement1723227311688 {
    constructor() {
        this.name = 'updateBehaviorManagement1723227311688';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD "other_specific_description" text
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP COLUMN "other_specific_description"
        `);
    }
}
exports.updateBehaviorManagement1723227311688 = updateBehaviorManagement1723227311688;
//# sourceMappingURL=1723227311688-updateBehaviorManagement.js.map