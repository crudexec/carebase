"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGenderEnums1727435829233 = void 0;
class updateGenderEnums1727435829233 {
    constructor() {
        this.name = 'updateGenderEnums1727435829233';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TYPE "public"."more_about_information_cared_for_by_enum"
            RENAME TO "more_about_information_cared_for_by_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_cared_for_by_enum" AS ENUM('female', 'male', 'no_preference')
        `);
        await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ALTER COLUMN "cared_for_by" TYPE "public"."more_about_information_cared_for_by_enum" USING "cared_for_by"::"text"::"public"."more_about_information_cared_for_by_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_cared_for_by_enum_old"
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_cared_for_by_enum_old" AS ENUM('female', 'male')
        `);
        await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ALTER COLUMN "cared_for_by" TYPE "public"."more_about_information_cared_for_by_enum_old" USING "cared_for_by"::"text"::"public"."more_about_information_cared_for_by_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_cared_for_by_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."more_about_information_cared_for_by_enum_old"
            RENAME TO "more_about_information_cared_for_by_enum"
        `);
    }
}
exports.updateGenderEnums1727435829233 = updateGenderEnums1727435829233;
//# sourceMappingURL=1727435829233-updateGenderEnums.js.map