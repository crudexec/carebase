import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitGoal1721763039121 implements MigrationInterface {
  name = 'updateVisitGoal1721763039121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
                RENAME COLUMN "visit_goal_id" TO "visit_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "visit_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "visit_goal_ids" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "visit_goal_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "visit_goal_ids" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
                RENAME COLUMN "visit_goal_ids" TO "visit_goal_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b" FOREIGN KEY ("visit_goal_id") REFERENCES "visit_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
