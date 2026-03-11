import {MigrationInterface, QueryRunner} from "typeorm";

export class updateRelationshipInVisits1735327919961 implements MigrationInterface {
    name = 'updateRelationshipInVisits1735327919961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights" DROP CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925"
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
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "FK_f26327c6a457ad80d44f34c6198"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "UQ_f26327c6a457ad80d44f34c6198"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "UQ_e000edd7f9b94bd7c972feb7ea2"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_6daa72e0575556147359ea2a24f"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "REL_5cee128444602e7d0b6ee80d91"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "REL_6daa72e0575556147359ea2a24"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "FK_f26327c6a457ad80d44f34c6198" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c" FOREIGN KEY ("basic_information_id") REFERENCES "treatment_basic_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_6daa72e0575556147359ea2a24f" FOREIGN KEY ("treatment_schedule_id") REFERENCES "treatment_schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights"
            ADD CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925" FOREIGN KEY ("visit_full_form_id") REFERENCES "fc_visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "fc_session_highlights" DROP CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_6daa72e0575556147359ea2a24f"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "FK_f26327c6a457ad80d44f34c6198"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "REL_6daa72e0575556147359ea2a24" UNIQUE ("treatment_schedule_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "REL_5cee128444602e7d0b6ee80d91" UNIQUE ("basic_information_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_6daa72e0575556147359ea2a24f" FOREIGN KEY ("treatment_schedule_id") REFERENCES "treatment_schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c" FOREIGN KEY ("basic_information_id") REFERENCES "treatment_basic_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "UQ_e000edd7f9b94bd7c972feb7ea2" UNIQUE ("intake_full_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "FK_e000edd7f9b94bd7c972feb7ea2" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "UQ_f26327c6a457ad80d44f34c6198" UNIQUE ("intake_full_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "FK_f26327c6a457ad80d44f34c6198" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "fc_session_highlights"
            ADD CONSTRAINT "FK_a2b6220fdd2dc4f16dd30252925" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
