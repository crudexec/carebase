import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApartmentNumberInModel1730400836529 implements MigrationInterface {
  name = 'updateApartmentNumberInModel1730400836529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "apartment_number" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD "apartment_number" integer
        `);
  }
}
