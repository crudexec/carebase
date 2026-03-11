"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.influenzaN95ModelUpdate1714263258315 = void 0;
class influenzaN95ModelUpdate1714263258315 {
    constructor() {
        this.name = 'influenzaN95ModelUpdate1714263258315';
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
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
        await queryRunner.query(`
            CREATE TABLE "influenza_vaccination_declination_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid,
                "declination_id" uuid,
                "signature_id" uuid,
                "status" "public"."influenza_vaccination_declination_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_e0764d23319adc9f83015600d9" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_04fa8da96c07ba2c3352d06451" UNIQUE ("declination_id"),
                CONSTRAINT "REL_5c6a84093d1cba7ef8b4331aac" UNIQUE ("signature_id"),
                CONSTRAINT "REL_0e544d0e967a9844848fa4c4da" UNIQUE ("user_id"),
                CONSTRAINT "PK_a463c67459c35c6458f30d7d473" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
        await queryRunner.query(`
            CREATE TABLE "n95_fit_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "attestation_id" uuid,
                "signature_id" uuid,
                "status" "public"."n95_fit_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_29a8ee1898294b6ba6fc4df4c9" UNIQUE ("attestation_id"),
                CONSTRAINT "REL_aed4fb676ea1b218fe7844562f" UNIQUE ("signature_id"),
                CONSTRAINT "REL_22390c43296a8cad2a9b1e89b4" UNIQUE ("user_id"),
                CONSTRAINT "PK_9244c444a29a0a41f320bec4fdd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination"
            ADD "can_change_mind_and_accept_vaccine" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature" DROP CONSTRAINT "FK_287e60154089c56ca6526c3476d"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ALTER COLUMN "influenza_form_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ALTER COLUMN "mmr_form_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ADD CONSTRAINT "FK_287e60154089c56ca6526c3476d" FOREIGN KEY ("influenza_form_id") REFERENCES "influenza_vaccination_declination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ADD CONSTRAINT "FK_e0764d23319adc9f83015600d91" FOREIGN KEY ("personal_information_id") REFERENCES "influenza_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ADD CONSTRAINT "FK_04fa8da96c07ba2c3352d064516" FOREIGN KEY ("declination_id") REFERENCES "influenza_vaccination_declination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ADD CONSTRAINT "FK_5c6a84093d1cba7ef8b4331aacf" FOREIGN KEY ("signature_id") REFERENCES "influenza_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ADD CONSTRAINT "FK_0e544d0e967a9844848fa4c4daa" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ADD CONSTRAINT "FK_29a8ee1898294b6ba6fc4df4c93" FOREIGN KEY ("attestation_id") REFERENCES "n95_fit_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ADD CONSTRAINT "FK_aed4fb676ea1b218fe7844562f3" FOREIGN KEY ("signature_id") REFERENCES "n95_fit_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ADD CONSTRAINT "FK_22390c43296a8cad2a9b1e89b4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form" DROP CONSTRAINT "FK_22390c43296a8cad2a9b1e89b4b"
        `);
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form" DROP CONSTRAINT "FK_aed4fb676ea1b218fe7844562f3"
        `);
        await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form" DROP CONSTRAINT "FK_29a8ee1898294b6ba6fc4df4c93"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form" DROP CONSTRAINT "FK_0e544d0e967a9844848fa4c4daa"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form" DROP CONSTRAINT "FK_5c6a84093d1cba7ef8b4331aacf"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form" DROP CONSTRAINT "FK_04fa8da96c07ba2c3352d064516"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form" DROP CONSTRAINT "FK_e0764d23319adc9f83015600d91"
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature" DROP CONSTRAINT "FK_287e60154089c56ca6526c3476d"
        `);
        await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ALTER COLUMN "mmr_form_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ALTER COLUMN "influenza_form_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ADD CONSTRAINT "FK_287e60154089c56ca6526c3476d" FOREIGN KEY ("influenza_form_id") REFERENCES "influenza_vaccination_declination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination" DROP COLUMN "can_change_mind_and_accept_vaccine"
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
            DROP TABLE "n95_fit_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "influenza_vaccination_declination_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
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
exports.influenzaN95ModelUpdate1714263258315 = influenzaN95ModelUpdate1714263258315;
//# sourceMappingURL=1714263258315-influenzaN95ModelUpdate.js.map