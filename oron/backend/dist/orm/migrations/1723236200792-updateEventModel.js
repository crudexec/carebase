"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventModel1723236200792 = void 0;
class updateEventModel1723236200792 {
    constructor() {
        this.name = 'updateEventModel1723236200792';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD "reschedule_approved" boolean DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_3b6748a12523bb060ce0237936f"
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "REL_3b6748a12523bb060ce0237936"
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_3b6748a12523bb060ce0237936f" FOREIGN KEY ("rescheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_3b6748a12523bb060ce0237936f"
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "REL_3b6748a12523bb060ce0237936" UNIQUE ("rescheduled_by")
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_3b6748a12523bb060ce0237936f" FOREIGN KEY ("rescheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP COLUMN "reschedule_approved"
        `);
    }
}
exports.updateEventModel1723236200792 = updateEventModel1723236200792;
//# sourceMappingURL=1723236200792-updateEventModel.js.map