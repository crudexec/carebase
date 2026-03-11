import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateContactInformation1725470628893 implements MigrationInterface {
  name = 'updateContactInformation1725470628893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "first_name" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "last_name" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "last_name"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ALTER COLUMN "first_name"
            SET NOT NULL
        `);
  }
}
