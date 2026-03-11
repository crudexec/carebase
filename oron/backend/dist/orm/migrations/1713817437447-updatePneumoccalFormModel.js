"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePneumoccalFormModel1713817437447 = void 0;
class updatePneumoccalFormModel1713817437447 {
    constructor() {
        this.name = 'updatePneumoccalFormModel1713817437447';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
        await queryRunner.query(`
            CREATE TABLE "pneumococcal_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employee_information_id" uuid,
                "pneumococcal_vaccination_form_id" uuid,
                "pneumococcal_signature_id" uuid,
                "status" "public"."pneumococcal_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_4a4cebd6ddd7ffecc1c721ced4" UNIQUE ("employee_information_id"),
                CONSTRAINT "REL_3a9a2573ee34cacf63596a2a44" UNIQUE ("pneumococcal_vaccination_form_id"),
                CONSTRAINT "REL_32304805985c12a36b0de768c2" UNIQUE ("pneumococcal_signature_id"),
                CONSTRAINT "REL_8465a1b57e875c735f7f561bc5" UNIQUE ("user_id"),
                CONSTRAINT "PK_8edfd98002abd0faf3f7571c9d6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "mmr_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_d601c59d870a161d2232e05a550" UNIQUE ("flu_form_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "mmr_form_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8" UNIQUE ("mmr_form_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ADD CONSTRAINT "FK_4a4cebd6ddd7ffecc1c721ced4d" FOREIGN KEY ("employee_information_id") REFERENCES "employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ADD CONSTRAINT "FK_3a9a2573ee34cacf63596a2a445" FOREIGN KEY ("pneumococcal_vaccination_form_id") REFERENCES "pneumococcal_vaccination_information_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ADD CONSTRAINT "FK_32304805985c12a36b0de768c2d" FOREIGN KEY ("pneumococcal_signature_id") REFERENCES "pneumococcal_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ADD CONSTRAINT "FK_8465a1b57e875c735f7f561bc50" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form" DROP CONSTRAINT "FK_8465a1b57e875c735f7f561bc50"
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form" DROP CONSTRAINT "FK_32304805985c12a36b0de768c2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form" DROP CONSTRAINT "FK_3a9a2573ee34cacf63596a2a445"
        `);
        await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form" DROP CONSTRAINT "FK_4a4cebd6ddd7ffecc1c721ced4d"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "mmr_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_d601c59d870a161d2232e05a550" UNIQUE ("flu_form_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "mmr_form_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8" UNIQUE ("mmr_form_id")
        `);
        await queryRunner.query(`
            DROP TABLE "pneumococcal_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updatePneumoccalFormModel1713817437447 = updatePneumoccalFormModel1713817437447;
//# sourceMappingURL=1713817437447-updatePneumoccalFormModel.js.map