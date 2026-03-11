import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalFieldsToVisitFullForm1772518643000
  implements MigrationInterface
{
  name = 'AddApprovalFieldsToVisitFullForm1772518643000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add approved_by column
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "approved_by" uuid
        `);

    // Add approved_at column
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "approved_at" TIMESTAMP
        `);

    // Add review_notes column
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "review_notes" text
        `);

    // Add foreign key constraint for approved_by
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_visit_full_form_approved_by"
            FOREIGN KEY ("approved_by")
            REFERENCES "users"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);

    // Add index on status column for faster queries
    await queryRunner.query(`
            CREATE INDEX "IDX_visit_full_form_status"
            ON "visit_full_form" ("status")
        `);

    // Add index on approved_by column
    await queryRunner.query(`
            CREATE INDEX "IDX_visit_full_form_approved_by"
            ON "visit_full_form" ("approved_by")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
            DROP INDEX "IDX_visit_full_form_approved_by"
        `);

    await queryRunner.query(`
            DROP INDEX "IDX_visit_full_form_status"
        `);

    // Drop foreign key constraint
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP CONSTRAINT "FK_visit_full_form_approved_by"
        `);

    // Drop columns
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "review_notes"
        `);

    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "approved_at"
        `);

    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            DROP COLUMN "approved_by"
        `);
  }
}
