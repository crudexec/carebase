"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleEvent1722442623562 = void 0;
class updateScheduleEvent1722442623562 {
    constructor() {
        this.name = 'updateScheduleEvent1722442623562';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_3aa388e160038869926189c4c8e"
        `);
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "REL_3aa388e160038869926189c4c8"
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_3aa388e160038869926189c4c8e" FOREIGN KEY ("scheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_3aa388e160038869926189c4c8e"
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "REL_3aa388e160038869926189c4c8" UNIQUE ("scheduled_by")
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_3aa388e160038869926189c4c8e" FOREIGN KEY ("scheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updateScheduleEvent1722442623562 = updateScheduleEvent1722442623562;
//# sourceMappingURL=1722442623562-updateScheduleEvent.js.map