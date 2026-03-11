import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewBioDataModel1712175326725 implements MigrationInterface {
  name = 'NewBioDataModel1712175326725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user-bio-data" (
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
                CONSTRAINT "UQ_4bdba61381721d3c8221ba0076e" UNIQUE ("email"),
                CONSTRAINT "REL_2c8dd7979c88206d8601499b71" UNIQUE ("user_id"),
                CONSTRAINT "PK_36adfd934dbd69edf5d14f3816b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD CONSTRAINT "FK_2c8dd7979c88206d8601499b719" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP CONSTRAINT "FK_2c8dd7979c88206d8601499b719"
        `);
    await queryRunner.query(`
            DROP TABLE "user-bio-data"
        `);
  }
}
