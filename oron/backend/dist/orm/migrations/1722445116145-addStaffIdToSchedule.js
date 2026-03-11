"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStaffIdToSchedule1722445116145 = void 0;
class addStaffIdToSchedule1722445116145 {
    constructor() {
        this.name = 'addStaffIdToSchedule1722445116145';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD "employee_or_staff_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_7808dce60984b93563c1aaf95e5" FOREIGN KEY ("employee_or_staff_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_7808dce60984b93563c1aaf95e5"
        `);
        await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "employee_or_staff_id"
        `);
    }
}
exports.addStaffIdToSchedule1722445116145 = addStaffIdToSchedule1722445116145;
//# sourceMappingURL=1722445116145-addStaffIdToSchedule.js.map