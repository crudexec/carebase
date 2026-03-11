"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventScheduleModel1727980130584 = void 0;
class eventScheduleModel1727980130584 {
    constructor() {
        this.name = 'eventScheduleModel1727980130584';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD "event_approved" boolean NOT NULL DEFAULT false
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "event_approved"
        `);
    }
}
exports.eventScheduleModel1727980130584 = eventScheduleModel1727980130584;
//# sourceMappingURL=1727980130584-eventScheduleModel.js.map