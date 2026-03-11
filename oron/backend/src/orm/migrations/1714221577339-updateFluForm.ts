import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateFluForm1714221577339 implements MigrationInterface {
  name = 'updateFluForm1714221577339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME COLUMN "user_id" TO "signed_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME CONSTRAINT "UQ_5d58ca1a9632ef41cf979ad826f" TO "UQ_d00e8741d214d665ee67c548d88"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
                RENAME COLUMN "immunization_description" TO "immunization_descripton"
        `);
    await queryRunner.query(`
            ALTER TABLE "ppd_administration_form"
                RENAME COLUMN "immunization_description" TO "immunization_descripton"
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
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae"
        `);

    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ALTER COLUMN "varicella_form_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_d00e8741d214d665ee67c548d88" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ADD CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae" FOREIGN KEY ("tb_form_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_d00e8741d214d665ee67c548d88"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ALTER COLUMN "varicella_form_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ALTER COLUMN "tb_form_id" DROP
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ADD CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae" FOREIGN KEY ("tb_form_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "ppd_administration_form"
                RENAME COLUMN "immunization_descripton" TO "immunization_description"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
                RENAME COLUMN "immunization_descripton" TO "immunization_description"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME CONSTRAINT "UQ_d00e8741d214d665ee67c548d88" TO "UQ_5d58ca1a9632ef41cf979ad826f"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME COLUMN "signed_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
