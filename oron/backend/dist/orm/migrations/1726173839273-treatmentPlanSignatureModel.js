"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatmentPlanSignatureModel1726173839273 = void 0;
class treatmentPlanSignatureModel1726173839273 {
    constructor() {
        this.name = 'treatmentPlanSignatureModel1726173839273';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "treatment_goal_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" character varying,
                "signature_url" character varying,
                "intake_full_id" uuid,
                "treatment_full_id" uuid,
                "signed_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_acb4f23e4637143872262aca6a8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "profile_picture" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD CONSTRAINT "FK_dfe5db21ffa1c9df523d225b1d6" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD CONSTRAINT "FK_ade4be20e0737cf3d6ad1fe614a" FOREIGN KEY ("treatment_full_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ADD CONSTRAINT "FK_288ecfe829b3b812fcfaedee9ed" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP CONSTRAINT "FK_288ecfe829b3b812fcfaedee9ed"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP CONSTRAINT "FK_ade4be20e0737cf3d6ad1fe614a"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature" DROP CONSTRAINT "FK_dfe5db21ffa1c9df523d225b1d6"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "profile_picture"
        `);
        await queryRunner.query(`
            DROP TABLE "treatment_goal_signature"
        `);
    }
}
exports.treatmentPlanSignatureModel1726173839273 = treatmentPlanSignatureModel1726173839273;
//# sourceMappingURL=1726173839273-treatmentPlanSignatureModel.js.map