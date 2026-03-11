"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatei9FormModel1713564182254 = void 0;
class updatei9FormModel1713564182254 {
    constructor() {
        this.name = 'updatei9FormModel1713564182254';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
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
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_a71b2e154fe9575a5f9570e7299"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_078d5b45c2c567767eaa3c2ef4a"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_5b466e544710799451e0c29b118"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_b6c834bd3d0f573bd15106c0afe"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form" DROP CONSTRAINT "FK_21035baeb4371944b5c8076cbea"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "personal_information_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "citizenship_form_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "document_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "signature_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "owner" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
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
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "owner"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "signature_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "document_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "citizenship_form_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "personal_information_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_21035baeb4371944b5c8076cbea" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_b6c834bd3d0f573bd15106c0afe" FOREIGN KEY ("signature_id") REFERENCES "signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_5b466e544710799451e0c29b118" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_078d5b45c2c567767eaa3c2ef4a" FOREIGN KEY ("citizenship_form_id") REFERENCES "citizenship_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "i9_form"
            ADD CONSTRAINT "FK_a71b2e154fe9575a5f9570e7299" FOREIGN KEY ("personal_information_id") REFERENCES "personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updatei9FormModel1713564182254 = updatei9FormModel1713564182254;
//# sourceMappingURL=1713564182254-updatei9FormModel.js.map