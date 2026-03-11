import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateIntakeForProfilePicture1720123613063 implements MigrationInterface {
  name = 'updateIntakeForProfilePicture1720123613063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD "profile_picture" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP COLUMN "profile_picture"
        `);
  }
}
