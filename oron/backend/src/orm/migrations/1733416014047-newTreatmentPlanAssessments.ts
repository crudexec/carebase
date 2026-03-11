import {MigrationInterface, QueryRunner} from "typeorm";

export class newTreatmentPlanAssessments1733416014047 implements MigrationInterface {
    name = 'newTreatmentPlanAssessments1733416014047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "fc_family_discussion" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "accomplishments_client_made_void_of_family_consultation_treatment" text,
                "accomplishments_client_family_made_void_of_family_consultation_treatment" text,
                "topic_not_related_discussed_during_family_consultation" text,
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_9068c16e628cc22d968d9f3194b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fc_session_highlights" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "session_ocurred_in" character varying,
                "those_present_for_the_family_consultant_session" text,
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_1e3dc0cb7a404a11a5d4e5829ce" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fc_treatment_plan_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" character varying,
                "signature_url" character varying,
                "parent_signature_url" character varying,
                "treatment_full_id" uuid,
                "signed_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_d0b652b0918288679ad92139fd8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."fc_visit_goal_status_enum" AS ENUM(
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
            CREATE TABLE "fc_visit_goal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "short_term_objective" text,
                "family_members_goal_discussed_with" text,
                "current_teaching_methods_or_strategies" text,
                "parent_or_family_members_challenges_when_implementing_strategies" text,
                "traing_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies" text,
                "additional_comments" text,
                "status" "public"."fc_visit_goal_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_c09c50494413bddbf11a0ea98e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "topic_not_related_discussed_during_family_consultation"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD "treatment_plan_type" "public"."treatment_full_plan_treatment_plan_type_enum" DEFAULT 'IISS_Assessment'
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
            ALTER TABLE "fc_family_discussion"
            ADD "topic_not_related_discussed_during_family_consultation" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_communication_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_behavior_intervention_strategies" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "training_and_consultation_provided_on_safety_at_home_and_in_the_community" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "any_other_training_and_consultation_topics" text
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter" DROP CONSTRAINT "FK_61c2934a49d5047e82f6f468153"
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter" DROP CONSTRAINT "REL_61c2934a49d5047e82f6f46815"
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter"
            ADD CONSTRAINT "FK_61c2934a49d5047e82f6f468153" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD CONSTRAINT "FK_05aa06b987b0d28a8f41d5659f6" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD CONSTRAINT "FK_adc3f7ac48a0bcb989e67a9e43c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights"
            ADD CONSTRAINT "FK_6d5097dab966568a37a521d11ad" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights"
            ADD CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights"
            ADD CONSTRAINT "FK_07e343a949bcbe1c3e98e6f85ee" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ADD CONSTRAINT "FK_fe3fa8f0cf79101343212c1efc5" FOREIGN KEY ("treatment_full_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ADD CONSTRAINT "FK_05a185dacd6949bd13233f9b44e" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD CONSTRAINT "FK_977972c7bc4613d298d127e16f8" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal"
            ADD CONSTRAINT "FK_bd6c5c4c163fa93c7de2780366b" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP CONSTRAINT "FK_bd6c5c4c163fa93c7de2780366b"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP CONSTRAINT "FK_5cfb2d4ae3acf1ae59855aadd36"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_visit_goal" DROP CONSTRAINT "FK_977972c7bc4613d298d127e16f8"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature" DROP CONSTRAINT "FK_05a185dacd6949bd13233f9b44e"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature" DROP CONSTRAINT "FK_fe3fa8f0cf79101343212c1efc5"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights" DROP CONSTRAINT "FK_07e343a949bcbe1c3e98e6f85ee"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights" DROP CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights" DROP CONSTRAINT "FK_6d5097dab966568a37a521d11ad"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP CONSTRAINT "FK_adc3f7ac48a0bcb989e67a9e43c"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP CONSTRAINT "FK_05aa06b987b0d28a8f41d5659f6"
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter" DROP CONSTRAINT "FK_61c2934a49d5047e82f6f468153"
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter"
            ADD CONSTRAINT "REL_61c2934a49d5047e82f6f46815" UNIQUE ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "offer_letter"
            ADD CONSTRAINT "FK_61c2934a49d5047e82f6f468153" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "any_other_training_and_consultation_topics"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_safety_at_home_and_in_the_community"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_behavior_intervention_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_communication_strategies"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "topic_not_related_discussed_during_family_consultation"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_family_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP COLUMN "accomplishments_client_made_void_of_family_consultation_treatment"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP COLUMN "treatment_plan_type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "topic_not_related_discussed_during_family_consultation" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_family_made_void_of_family_consultation_treatment" text
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD "accomplishments_client_made_void_of_family_consultation_treatment" text
        `);
        await queryRunner.query(`
            DROP TABLE "fc_visit_goal"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."fc_visit_goal_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "fc_treatment_plan_signature"
        `);
        await queryRunner.query(`
            DROP TABLE "fc_session_highlights"
        `);
        await queryRunner.query(`
            DROP TABLE "fc_family_discussion"
        `);
    }

}
