"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApartmentNumberInModel1730400836529 = void 0;
class updateApartmentNumberInModel1730400836529 {
    constructor() {
        this.name = 'updateApartmentNumberInModel1730400836529';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "apartment_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "apartment_number" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "apartment_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "apartment_number" integer
        `);
    }
}
exports.updateApartmentNumberInModel1730400836529 = updateApartmentNumberInModel1730400836529;
//# sourceMappingURL=1730400836529-updateApartmentNumberInModel.js.map