"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTISpecificModel1743623765498 = void 0;
class createTISpecificModel1743623765498 {
    constructor() {
        this.name = 'createTISpecificModel1743623765498';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."transportation_type_and_objectives_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft',
                'not_filled',
                'not_sent',
                'awaiting_signature',
                'signed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "transportation_type_and_objectives" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transportation_type_details" json,
                "transportation_safety_objectives" json,
                "unusual_occurrences" json,
                "traffic_sign_recognition" json,
                "directional_concepts" json,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "status" "public"."transportation_type_and_objectives_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "registered_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_47fdc5e9daedd5a4c9fa1ff95f3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatme"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_use_of_augmentative_and_a"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_behavior_intervention_str"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_safety_at_home_and_in_the"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "parent_or_family_members_challenges_when_implementing_strategie"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "training_instruction_provided_to_parent_or_family_member_on_how"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_made_void_of_family_consultation_treatment" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_family_made_void_of_family_consultation_treatment" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_behavior_intervention_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_safety_at_home_and_in_the_community" text
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "assist_to_arrange_chairs" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "assist_to_arrange_tables" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "assist_to_turn_off_light" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "assist_to_turn_off_computer" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "assist_to_arrange_bookshelves" boolean
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "transportation_type_and_objectives_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "parent_or_family_members_challenges_when_implementing_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives"
            ADD CONSTRAINT "FK_365069ddf1ac65dd6c4dd507616" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives"
            ADD CONSTRAINT "FK_e92b886bfa5a21dec0816a0ba37" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives"
            ADD CONSTRAINT "FK_bfceff942a0a9de7de03ad8e048" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_6b7ddd524e8579513e9e4d32992" FOREIGN KEY ("transportation_type_and_objectives_id") REFERENCES "transportation_type_and_objectives"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_6b7ddd524e8579513e9e4d32992"
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives" DROP CONSTRAINT "FK_bfceff942a0a9de7de03ad8e048"
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives" DROP CONSTRAINT "FK_e92b886bfa5a21dec0816a0ba37"
        `);
        await queryRunner.query(`
            ALTER TABLE "transportation_type_and_objectives" DROP CONSTRAINT "FK_365069ddf1ac65dd6c4dd507616"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "parent_or_family_members_challenges_when_implementing_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "transportation_type_and_objectives_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "assist_to_arrange_bookshelves"
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "assist_to_turn_off_computer"
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "assist_to_turn_off_light"
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "assist_to_arrange_tables"
        `);
        await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "assist_to_arrange_chairs"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_safety_at_home_and_in_the_community"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_behavior_intervention_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP COLUMN "training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "training_instruction_provided_to_parent_or_family_member_on_how" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "parent_or_family_members_challenges_when_implementing_strategie" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_safety_at_home_and_in_the" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_behavior_intervention_str" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD "training_and_consultation_provided_on_use_of_augmentative_and_a" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_family_made_void_of_family_consultation_" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_made_void_of_family_consultation_treatme" text
        `);
        await queryRunner.query(`
            DROP TABLE "transportation_type_and_objectives"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transportation_type_and_objectives_status_enum"
        `);
    }
}
exports.createTISpecificModel1743623765498 = createTISpecificModel1743623765498;
//# sourceMappingURL=1743623765498-createTISpecificModel.js.map