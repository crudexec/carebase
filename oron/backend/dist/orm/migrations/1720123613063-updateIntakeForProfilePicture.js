"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIntakeForProfilePicture1720123613063 = void 0;
class updateIntakeForProfilePicture1720123613063 {
    constructor() {
        this.name = 'updateIntakeForProfilePicture1720123613063';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "profile_picture" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "profile_picture"
        `);
    }
}
exports.updateIntakeForProfilePicture1720123613063 = updateIntakeForProfilePicture1720123613063;
//# sourceMappingURL=1720123613063-updateIntakeForProfilePicture.js.map