import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitGoalObjectives1721861371140 implements MigrationInterface {
  name = 'updateVisitGoalObjectives1721861371140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "goal_background" text
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "short_term_objective" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "short_term_objective"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "goal_background"
        `);
  }
}
