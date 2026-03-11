import { MigrationInterface, QueryRunner } from 'typeorm';

export class userGenericDocumentUploadModel1715115795038 implements MigrationInterface {
  name = 'userGenericDocumentUploadModel1715115795038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_document" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "document_url" character varying NOT NULL,
                "document_title" character varying NOT NULL,
                "owner" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_18a41ed5aafb9732cfa62c8debd" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ADD CONSTRAINT "FK_e6332d1e1f5ca3634070b3b424b" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_document" DROP CONSTRAINT "FK_e6332d1e1f5ca3634070b3b424b"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            DROP TABLE "user_document"
        `);
  }
}
