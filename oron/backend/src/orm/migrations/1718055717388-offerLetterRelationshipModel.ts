import { MigrationInterface, QueryRunner } from 'typeorm';

export class offerLetterRelationshipModel1718055717388 implements MigrationInterface {
  name = 'offerLetterRelationshipModel1718055717388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "offer_letter"
            ADD "offer_letter_pdf_url" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "offer_letter" DROP COLUMN "offer_letter_pdf_url"
        `);
  }
}
