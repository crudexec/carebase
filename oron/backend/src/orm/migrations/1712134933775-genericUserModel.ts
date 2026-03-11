import { MigrationInterface, QueryRunner } from 'typeorm';

export class genericUserModel1712134933775 implements MigrationInterface {
  name = 'genericUserModel1712134933775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" character varying(30) NOT NULL DEFAULT 'STANDARD',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
