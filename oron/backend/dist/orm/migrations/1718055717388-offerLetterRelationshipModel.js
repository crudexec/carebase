"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerLetterRelationshipModel1718055717388 = void 0;
class offerLetterRelationshipModel1718055717388 {
    constructor() {
        this.name = 'offerLetterRelationshipModel1718055717388';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "offer_letter"
            ADD "offer_letter_pdf_url" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "offer_letter" DROP COLUMN "offer_letter_pdf_url"
        `);
    }
}
exports.offerLetterRelationshipModel1718055717388 = offerLetterRelationshipModel1718055717388;
//# sourceMappingURL=1718055717388-offerLetterRelationshipModel.js.map