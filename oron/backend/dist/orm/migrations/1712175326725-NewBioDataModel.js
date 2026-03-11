"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewBioDataModel1712175326725 = void 0;
class NewBioDataModel1712175326725 {
    constructor() {
        this.name = 'NewBioDataModel1712175326725';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "user-bio-data" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "middle_name" character varying,
                "other_last_name" character varying,
                "email" character varying NOT NULL,
                "phone" character varying,
                "address" character varying,
                "apartment_number" character varying,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "social_security_number" character varying,
                "user_id" uuid NOT NULL,
                "form_completed" boolean NOT NULL DEFAULT false,
                "form_completed_by" character varying,
                "form_filled_by" character varying,
                "form_completed_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_4bdba61381721d3c8221ba0076e" UNIQUE ("email"),
                CONSTRAINT "REL_2c8dd7979c88206d8601499b71" UNIQUE ("user_id"),
                CONSTRAINT "PK_36adfd934dbd69edf5d14f3816b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD CONSTRAINT "FK_2c8dd7979c88206d8601499b719" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP CONSTRAINT "FK_2c8dd7979c88206d8601499b719"
        `);
        await queryRunner.query(`
            DROP TABLE "user-bio-data"
        `);
    }
}
exports.NewBioDataModel1712175326725 = NewBioDataModel1712175326725;
//# sourceMappingURL=1712175326725-NewBioDataModel.js.map