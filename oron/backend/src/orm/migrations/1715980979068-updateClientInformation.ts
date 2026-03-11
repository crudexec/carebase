import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateClientInformation1715980979068 implements MigrationInterface {
  name = 'updateClientInformation1715980979068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "citizenship_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."client_information_citizenship_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d" UNIQUE ("employee_personal_information_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d" UNIQUE ("employee_personal_information_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."client_information_citizenship_status_enum" AS ENUM(
                'A citizen of the United States',
                'A noncitizen national of the United States',
                'A lawful permanent resident',
                'A non-citizen authorized to work'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "citizenship_status" "public"."client_information_citizenship_status_enum" NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
