import { MigrationInterface, QueryRunner } from 'typeorm';

export class genericUserModelUpdate1712137049407 implements MigrationInterface {
  name = 'genericUserModelUpdate1712137049407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "id"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "role"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "role" character varying NOT NULL DEFAULT 'STANDARD'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "role"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "role" character varying(30) NOT NULL DEFAULT 'STANDARD'
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "id"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "id" SERIAL NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        `);
  }
}
