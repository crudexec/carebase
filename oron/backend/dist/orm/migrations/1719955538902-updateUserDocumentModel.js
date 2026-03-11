"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDocumentModel1719955538902 = void 0;
class updateUserDocumentModel1719955538902 {
    constructor() {
        this.name = 'updateUserDocumentModel1719955538902';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."user_document_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user_document"
            ADD "status" "public"."user_document_status_enum" DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_document"
            ADD "review_notes" text
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user_document" DROP COLUMN "review_notes"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_document" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_document_status_enum"
        `);
    }
}
exports.updateUserDocumentModel1719955538902 = updateUserDocumentModel1719955538902;
//# sourceMappingURL=1719955538902-updateUserDocumentModel.js.map