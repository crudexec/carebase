import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserDocumentModel1719955538902 implements MigrationInterface {
  name = 'updateUserDocumentModel1719955538902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."user_document_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ADD "status" "public"."user_document_status_enum" DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ADD "review_notes" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_document" DROP COLUMN "review_notes"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_document_status_enum"
        `);
  }
}
