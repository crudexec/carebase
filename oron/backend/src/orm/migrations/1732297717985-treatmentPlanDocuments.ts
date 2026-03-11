import { MigrationInterface, QueryRunner } from 'typeorm';

export class treatmentPlanDocuments1732297717985 implements MigrationInterface {
  name = 'treatmentPlanDocuments1732297717985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "treatment_plan_documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "document_name" character varying,
                "description" character varying,
                "document_url" character varying,
                "intake_full_id" uuid,
                "uploaded_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_417a5bb54a5c396e73e09f4a703" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ADD CONSTRAINT "FK_c68c2489373b7ea2b19e9f5c4d6" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ADD CONSTRAINT "FK_55eecc760b58b6189847745d3c6" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents" DROP CONSTRAINT "FK_55eecc760b58b6189847745d3c6"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents" DROP CONSTRAINT "FK_c68c2489373b7ea2b19e9f5c4d6"
        `);
    await queryRunner.query(`
            DROP TABLE "treatment_plan_documents"
        `);
  }
}
