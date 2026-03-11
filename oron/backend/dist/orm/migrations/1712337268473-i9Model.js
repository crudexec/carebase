"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i9Model1712337268473 = void 0;
class i9Model1712337268473 {
    constructor() {
        this.name = 'i9Model1712337268473';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."citizenship_form_citizenship_status_enum" AS ENUM(
                'A citizen of the United States',
                'A noncitizen national of the United States',
                'A lawful permanent resident',
                'A non-citizen authorized to work'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "citizenship_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "citizenship_status" "public"."citizenship_form_citizenship_status_enum" NOT NULL,
                "uscis_number" character varying,
                "work_license_expiry_date" TIMESTAMP,
                "i_94_number" character varying,
                "foreign_passport_number" character varying,
                "foreign_passport_issuing_country" character varying,
                "owner" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_45c74232a55b6589bdf33a1d63" UNIQUE ("owner"),
                CONSTRAINT "PK_142897abb4943702b6cf657eb49" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "issuing_authority" character varying NOT NULL,
                "document_number" character varying NOT NULL,
                "file_url" character varying NOT NULL,
                "expiration_date" TIMESTAMP NOT NULL,
                "owner" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "personal_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "middle_name" character varying,
                "other_last_name" character varying,
                "email" character varying NOT NULL,
                "phone" character varying,
                "address" character varying,
                "apartment_number" character varying,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "social_security_number" character varying,
                "user_id" uuid NOT NULL,
                "form_completed" boolean NOT NULL DEFAULT false,
                "form_completed_by" character varying,
                "form_filled_by" character varying,
                "form_completed_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_2fc12ee8ee3db62142a641335c3" UNIQUE ("email"),
                CONSTRAINT "REL_315fa91bcec18322aa6ee5c195" UNIQUE ("user_id"),
                CONSTRAINT "PK_b870ed544fc4806dfeb05750237" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_c9697c973645c3a5fa99647c3c" UNIQUE ("signed_by"),
                CONSTRAINT "PK_8e62734171afc1d7c9570be27fb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "i9_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid NOT NULL,
                "citizenship_form_id" uuid NOT NULL,
                "document_id" uuid NOT NULL,
                "signature_id" uuid NOT NULL,
                "owner" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a71b2e154fe9575a5f9570e729" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_078d5b45c2c567767eaa3c2ef4" UNIQUE ("citizenship_form_id"),
                CONSTRAINT "REL_5b466e544710799451e0c29b11" UNIQUE ("document_id"),
                CONSTRAINT "REL_b6c834bd3d0f573bd15106c0af" UNIQUE ("signature_id"),
                CONSTRAINT "REL_21035baeb4371944b5c8076cbe" UNIQUE ("owner"),
                CONSTRAINT "PK_5bcef587b54c968827224e4340c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "citizenship_form"
            ADD CONSTRAINT "FK_45c74232a55b6589bdf33a1d633" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD CONSTRAINT "FK_3aea219ca042e9ba43d9a366e38" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information"
            ADD CONSTRAINT "FK_315fa91bcec18322aa6ee5c1951" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "signature"
            ADD CONSTRAINT "FK_c9697c973645c3a5fa99647c3c4" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_a71b2e154fe9575a5f9570e7299" FOREIGN KEY ("personal_information_id") REFERENCES "personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_078d5b45c2c567767eaa3c2ef4a" FOREIGN KEY ("citizenship_form_id") REFERENCES "citizenship_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_5b466e544710799451e0c29b118" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_b6c834bd3d0f573bd15106c0afe" FOREIGN KEY ("signature_id") REFERENCES "signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_21035baeb4371944b5c8076cbea" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_21035baeb4371944b5c8076cbea"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_b6c834bd3d0f573bd15106c0afe"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_5b466e544710799451e0c29b118"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_078d5b45c2c567767eaa3c2ef4a"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_a71b2e154fe9575a5f9570e7299"
        `);
        await queryRunner.query(`
            ALTER TABLE "signature" DROP CONSTRAINT "FK_c9697c973645c3a5fa99647c3c4"
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information" DROP CONSTRAINT "FK_315fa91bcec18322aa6ee5c1951"
        `);
        await queryRunner.query(`
            ALTER TABLE "documents" DROP CONSTRAINT "FK_3aea219ca042e9ba43d9a366e38"
        `);
        await queryRunner.query(`
            ALTER TABLE "citizenship_form" DROP CONSTRAINT "FK_45c74232a55b6589bdf33a1d633"
        `);
        await queryRunner.query(`
            DROP TABLE "i9_form"
        `);
        await queryRunner.query(`
            DROP TABLE "signature"
        `);
        await queryRunner.query(`
            DROP TABLE "personal_information"
        `);
        await queryRunner.query(`
            DROP TABLE "documents"
        `);
        await queryRunner.query(`
            DROP TABLE "citizenship_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."citizenship_form_citizenship_status_enum"
        `);
    }
}
exports.i9Model1712337268473 = i9Model1712337268473;
//# sourceMappingURL=1712337268473-i9Model.js.map