import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateFcModel1734121197122 implements MigrationInterface {
    name = 'UpdateFcModel1734121197122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36"
        `);
        await queryRunner.query(`
            CREATE TABLE "fc_other_training" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication" text,
                "training_and_consultation_provided_on_communication_strategies" text,
                "training_and_consultation_provided_on_behavior_intervention_strategies" text,
                "training_and_consultation_provided_on_safety_at_home_and_in_the_community" text,
                "any_other_training_and_consultation_topics" text,
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_72264ac52fa7bac14bf5d96610e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."fc_visit_full_form_status_enum" AS ENUM(
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
            CREATE TABLE "fc_visit_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "session_highlights_id" uuid,
                "family_discussion_id" uuid,
                "treatment_plan_signature_id" uuid,
                "other_training_id" uuid,
                "visit_goal_ids" text,
                "status" "public"."fc_visit_full_form_status_enum" DEFAULT 'draft',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "registered_by" uuid,
                "date_of_visit" TIMESTAMP,
                "start_time" character varying,
                "intake_full_id" uuid,
                "end_time" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_5ce2f4ca8d293ac669ecbf4200c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatme"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_use_of_augmentative_and_a"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_communication_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_behavior_intervention_str"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_safety_at_home_and_in_the"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "any_other_training_and_consultation_topics"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "parent_or_family_members_challenges_when_implementing_strategie"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP COLUMN "traing_instruction_provided_to_parent_or_family_member_on_how_t"
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
            ALTER TABLE "fc_treatment_plan_signature"
            ADD "signed" boolean DEFAULT false
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."fc_treatment_plan_signature_status_enum" AS ENUM(
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
            ALTER TABLE "fc_treatment_plan_signature"
            ADD "status" "public"."fc_treatment_plan_signature_status_enum"
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
            ALTER TABLE "fc_treatment_plan_signature" DROP CONSTRAINT "FK_05a185dacd6949bd13233f9b44e"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ALTER COLUMN "signed_by" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ADD CONSTRAINT "FK_05a185dacd6949bd13233f9b44e" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD CONSTRAINT "FK_389c3647ecc0b22e4a11c9a1d9b" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD CONSTRAINT "FK_f6535e6c17521baed32616f9a90" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD CONSTRAINT "FK_59d97fc97426a7d054074dc1f6a" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_605b0b455ee39c7cba6b1f9720f" FOREIGN KEY ("session_highlights_id") REFERENCES "fc_session_highlights"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_6daa0fdb9039e405a0e26e3db92" FOREIGN KEY ("family_discussion_id") REFERENCES "fc_family_discussion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_22478434c7332ee63a604b19394" FOREIGN KEY ("treatment_plan_signature_id") REFERENCES "fc_treatment_plan_signature"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_791216ceef015403e719242cf3b" FOREIGN KEY ("other_training_id") REFERENCES "fc_other_training"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_3a335ecaf8f70566e82be910d79" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_cb0d67d9765b737dd15862acad9" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form"
            ADD CONSTRAINT "FK_377193318002324f1b1c438e410" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36" FOREIGN KEY ("visit_full_form_id") REFERENCES "fc_visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_377193318002324f1b1c438e410"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_cb0d67d9765b737dd15862acad9"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_3a335ecaf8f70566e82be910d79"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_791216ceef015403e719242cf3b"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_22478434c7332ee63a604b19394"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_6daa0fdb9039e405a0e26e3db92"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_full_form" DROP CONSTRAINT "FK_605b0b455ee39c7cba6b1f9720f"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP CONSTRAINT "FK_59d97fc97426a7d054074dc1f6a"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP CONSTRAINT "FK_f6535e6c17521baed32616f9a90"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP CONSTRAINT "FK_389c3647ecc0b22e4a11c9a1d9b"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature" DROP CONSTRAINT "FK_05a185dacd6949bd13233f9b44e"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ALTER COLUMN "signed_by"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ADD CONSTRAINT "FK_05a185dacd6949bd13233f9b44e" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "fc_treatment_plan_signature" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."fc_treatment_plan_signature_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature" DROP COLUMN "signed"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "traing_instruction_provided_to_parent_or_family_member_on_how_t" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD "parent_or_family_members_challenges_when_implementing_strategie" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "any_other_training_and_consultation_topics" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_safety_at_home_and_in_the" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_behavior_intervention_str" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_communication_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
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
            DROP TABLE "fc_visit_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."fc_visit_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "fc_other_training"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
