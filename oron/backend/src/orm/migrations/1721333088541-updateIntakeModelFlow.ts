import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateIntakeModelFlow1721333088541 implements MigrationInterface {
  name = 'updateIntakeModelFlow1721333088541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "first_name" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "last_name" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "account_id" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "account_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "last_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "first_name"
        `);
  }
}
