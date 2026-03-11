"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFluFormModels1714222358998 = void 0;
class updateFluFormModels1714222358998 {
    constructor() {
        this.name = 'updateFluFormModels1714222358998';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_d00e8741d214d665ee67c548d88"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME COLUMN "signed_by" TO "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME CONSTRAINT "UQ_d00e8741d214d665ee67c548d88" TO "UQ_5d58ca1a9632ef41cf979ad826f"
        `);
        await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
                RENAME COLUMN "immunization_descripton" TO "immunization_description"
        `);
        await queryRunner.query(`
            ALTER TABLE "ppd_administration_form"
                RENAME COLUMN "immunization_descripton" TO "immunization_description"
        `);
        await queryRunner.query(`
            CREATE TABLE "flu_signature_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "flu_form_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_7dd5873dd48d004ece359082e1" UNIQUE ("signed_by"),
                CONSTRAINT "REL_e8cc7caa35e874bc468c0925a7" UNIQUE ("flu_form_id"),
                CONSTRAINT "PK_ee1058a7670bde1fb0fd04141c5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
        await queryRunner.query(`
            CREATE TABLE "flu_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid,
                "attestation_id" uuid,
                "signature_id" uuid,
                "status" "public"."flu_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_b139150593516099b330cd331e" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_50d7a216845c904fd73873aac4" UNIQUE ("attestation_id"),
                CONSTRAINT "REL_7624ff4e7369b84fef93e72fa2" UNIQUE ("signature_id"),
                CONSTRAINT "REL_1ba935a1efd3b3bb91a3090a2d" UNIQUE ("user_id"),
                CONSTRAINT "PK_730c5453c429e118c50103976c3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
        await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ALTER COLUMN "varicella_form_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_signature_form"
            ADD CONSTRAINT "FK_7dd5873dd48d004ece359082e18" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_signature_form"
            ADD CONSTRAINT "FK_e8cc7caa35e874bc468c0925a74" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ADD CONSTRAINT "FK_b139150593516099b330cd331eb" FOREIGN KEY ("personal_information_id") REFERENCES "flu_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ADD CONSTRAINT "FK_50d7a216845c904fd73873aac4e" FOREIGN KEY ("attestation_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ADD CONSTRAINT "FK_7624ff4e7369b84fef93e72fa28" FOREIGN KEY ("signature_id") REFERENCES "flu_signature_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ADD CONSTRAINT "FK_1ba935a1efd3b3bb91a3090a2de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form" DROP CONSTRAINT "FK_1ba935a1efd3b3bb91a3090a2de"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form" DROP CONSTRAINT "FK_7624ff4e7369b84fef93e72fa28"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form" DROP CONSTRAINT "FK_50d7a216845c904fd73873aac4e"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_full_form" DROP CONSTRAINT "FK_b139150593516099b330cd331eb"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_signature_form" DROP CONSTRAINT "FK_e8cc7caa35e874bc468c0925a74"
        `);
        await queryRunner.query(`
            ALTER TABLE "flu_signature_form" DROP CONSTRAINT "FK_7dd5873dd48d004ece359082e18"
        `);
        await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ALTER COLUMN "varicella_form_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
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
            DROP TABLE "flu_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "flu_signature_form"
        `);
        await queryRunner.query(`
            ALTER TABLE "ppd_administration_form"
                RENAME COLUMN "immunization_description" TO "immunization_descripton"
        `);
        await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
                RENAME COLUMN "immunization_description" TO "immunization_descripton"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME CONSTRAINT "UQ_5d58ca1a9632ef41cf979ad826f" TO "UQ_d00e8741d214d665ee67c548d88"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME COLUMN "user_id" TO "signed_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_d00e8741d214d665ee67c548d88" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updateFluFormModels1714222358998 = updateFluFormModels1714222358998;
//# sourceMappingURL=1714222358998-updateFluFormModels.js.map