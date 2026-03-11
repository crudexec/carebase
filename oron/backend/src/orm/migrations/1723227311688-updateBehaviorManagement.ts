import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateBehaviorManagement1723227311688 implements MigrationInterface {
  name = 'updateBehaviorManagement1723227311688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD "other_specific_description" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP COLUMN "other_specific_description"
        `);
  }
}
