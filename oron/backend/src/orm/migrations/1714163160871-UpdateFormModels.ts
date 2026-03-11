import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFormModels1714163160871 implements MigrationInterface {
  name = 'UpdateFormModels1714163160871';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "hepatitis_b_attestation"
                RENAME COLUMN "signed_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
                RENAME CONSTRAINT "REL_d00e8741d214d665ee67c548d8" TO "UQ_5d58ca1a9632ef41cf979ad826f"
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
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            CREATE TABLE "hepatitis_b_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid,
                "attestation_id" uuid,
                "signature_id" uuid,
                "status" "public"."hepatitis_b_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a0fc1d974b5cdbc955224146f7" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_af1110d389335bfa16c3e01ebf" UNIQUE ("attestation_id"),
                CONSTRAINT "REL_4c4bdaf2944a2bacf0aeb535c4" UNIQUE ("signature_id"),
                CONSTRAINT "REL_ca27c3fd4f316db26f1c89f991" UNIQUE ("user_id"),
                CONSTRAINT "PK_6bc2e8717215cd9da306e1b3249" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            CREATE TABLE "mmr_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid,
                "attestation_id" uuid,
                "signature_id" uuid,
                "status" "public"."mmr_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a45b1d1e6c2b68a63e7b1bbb2d" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_bef6334095ecc65a31bba74cef" UNIQUE ("attestation_id"),
                CONSTRAINT "REL_7b6eb77084f28cf4d7b8201c6f" UNIQUE ("signature_id"),
                CONSTRAINT "REL_0fe9b7fb5e4b105723375fcaa5" UNIQUE ("user_id"),
                CONSTRAINT "PK_087425f4945d7ac7c9893ac9d0e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            CREATE TABLE "tuberculosis_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ppd_administration_form_id" uuid,
                "tuberculosis_testing_form_id" uuid,
                "tb_signature_id" uuid,
                "status" "public"."tuberculosis_full_form_status_enum" DEFAULT 'in_progress',
                "owner" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_19cdb14db33c1f570f9c449c99" UNIQUE ("ppd_administration_form_id"),
                CONSTRAINT "REL_ec2ccb5d1185c4bfdca7b2b6b7" UNIQUE ("tuberculosis_testing_form_id"),
                CONSTRAINT "REL_6fb1746cc6ec1bb2c36743fb1c" UNIQUE ("tb_signature_id"),
                CONSTRAINT "REL_1c01f52cff4129c15016838f93" UNIQUE ("owner"),
                CONSTRAINT "PK_6a92a0056e1f69da0da1d82b5d6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."varicella_full_form_status_enum" AS ENUM('in_progress', 'awaiting_approval', 'approved')
        `);
    await queryRunner.query(`
            CREATE TABLE "varicella_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "personal_information_id" uuid,
                "attestation_id" uuid,
                "signature_id" uuid,
                "status" "public"."varicella_full_form_status_enum" DEFAULT 'in_progress',
                "user_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_805811a2e4bfb7072347aa6fb4" UNIQUE ("personal_information_id"),
                CONSTRAINT "REL_95b31ee40aa369ee88ccd0f93c" UNIQUE ("attestation_id"),
                CONSTRAINT "REL_ef797d2b88e08aeb2c3ad0bcf7" UNIQUE ("signature_id"),
                CONSTRAINT "REL_58b89a7ec0ef44dbcaabd0af51" UNIQUE ("user_id"),
                CONSTRAINT "PK_62c9e23fef073f1595ff118e200" PRIMARY KEY ("id")
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
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ALTER COLUMN "tb_form_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ALTER COLUMN "varicella_form_id" DROP NOT NULL
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
            ALTER TABLE "hepatitis_b_full_form"
            ADD CONSTRAINT "FK_a0fc1d974b5cdbc955224146f79" FOREIGN KEY ("personal_information_id") REFERENCES "personal_information_hepatitis_b_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ADD CONSTRAINT "FK_af1110d389335bfa16c3e01ebfd" FOREIGN KEY ("attestation_id") REFERENCES "hepatitis_b_attestation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ADD CONSTRAINT "FK_4c4bdaf2944a2bacf0aeb535c47" FOREIGN KEY ("signature_id") REFERENCES "hepatitis_b_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ADD CONSTRAINT "FK_ca27c3fd4f316db26f1c89f991f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ADD CONSTRAINT "FK_a45b1d1e6c2b68a63e7b1bbb2d7" FOREIGN KEY ("personal_information_id") REFERENCES "mmr_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ADD CONSTRAINT "FK_bef6334095ecc65a31bba74cef7" FOREIGN KEY ("attestation_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ADD CONSTRAINT "FK_7b6eb77084f28cf4d7b8201c6f4" FOREIGN KEY ("signature_id") REFERENCES "mmr_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ADD CONSTRAINT "FK_0fe9b7fb5e4b105723375fcaa5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ADD CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae" FOREIGN KEY ("tb_form_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ADD CONSTRAINT "FK_19cdb14db33c1f570f9c449c998" FOREIGN KEY ("ppd_administration_form_id") REFERENCES "ppd_administration_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ADD CONSTRAINT "FK_ec2ccb5d1185c4bfdca7b2b6b75" FOREIGN KEY ("tuberculosis_testing_form_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ADD CONSTRAINT "FK_6fb1746cc6ec1bb2c36743fb1c2" FOREIGN KEY ("tb_signature_id") REFERENCES "tb_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ADD CONSTRAINT "FK_1c01f52cff4129c15016838f937" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ADD CONSTRAINT "FK_805811a2e4bfb7072347aa6fb44" FOREIGN KEY ("personal_information_id") REFERENCES "varicella_employee_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ADD CONSTRAINT "FK_95b31ee40aa369ee88ccd0f93c4" FOREIGN KEY ("attestation_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ADD CONSTRAINT "FK_ef797d2b88e08aeb2c3ad0bcf7e" FOREIGN KEY ("signature_id") REFERENCES "varicella_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ADD CONSTRAINT "FK_58b89a7ec0ef44dbcaabd0af516" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form" DROP CONSTRAINT "FK_58b89a7ec0ef44dbcaabd0af516"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form" DROP CONSTRAINT "FK_ef797d2b88e08aeb2c3ad0bcf7e"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form" DROP CONSTRAINT "FK_95b31ee40aa369ee88ccd0f93c4"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form" DROP CONSTRAINT "FK_805811a2e4bfb7072347aa6fb44"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form" DROP CONSTRAINT "FK_1c01f52cff4129c15016838f937"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form" DROP CONSTRAINT "FK_6fb1746cc6ec1bb2c36743fb1c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form" DROP CONSTRAINT "FK_ec2ccb5d1185c4bfdca7b2b6b75"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form" DROP CONSTRAINT "FK_19cdb14db33c1f570f9c449c998"
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form" DROP CONSTRAINT "FK_0fe9b7fb5e4b105723375fcaa5e"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form" DROP CONSTRAINT "FK_7b6eb77084f28cf4d7b8201c6f4"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form" DROP CONSTRAINT "FK_bef6334095ecc65a31bba74cef7"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form" DROP CONSTRAINT "FK_a45b1d1e6c2b68a63e7b1bbb2d7"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form" DROP CONSTRAINT "FK_ca27c3fd4f316db26f1c89f991f"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form" DROP CONSTRAINT "FK_4c4bdaf2944a2bacf0aeb535c47"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form" DROP CONSTRAINT "FK_af1110d389335bfa16c3e01ebfd"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form" DROP CONSTRAINT "FK_a0fc1d974b5cdbc955224146f79"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_5d58ca1a9632ef41cf979ad826f"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
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
            ALTER TABLE "tb_signature"
            ALTER COLUMN "tb_form_id"
            SET NOT NULL
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
            DROP TABLE "varicella_full_form"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "tuberculosis_full_form"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "mmr_full_form"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "hepatitis_b_full_form"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum"
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
                RENAME CONSTRAINT "UQ_5d58ca1a9632ef41cf979ad826f" TO "REL_d00e8741d214d665ee67c548d8"
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
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
