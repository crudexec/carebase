import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateBiodataForm1728054036001 implements MigrationInterface {
  name = 'updateBiodataForm1728054036001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "npi" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "lba" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "event_approved" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "event_approved"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "lba"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "npi"
        `);
  }
}
