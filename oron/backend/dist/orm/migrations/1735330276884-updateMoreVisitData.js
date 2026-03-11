"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMoreVisitData1735330276884 = void 0;
class updateMoreVisitData1735330276884 {
    constructor() {
        this.name = 'updateMoreVisitData1735330276884';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP CONSTRAINT "FK_f6535e6c17521baed32616f9a90"
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
            ALTER TABLE "fc_treatment_plan_signature"
            ADD "visit_full_form_id" uuid
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
            ALTER TABLE "fc_family_discussion"
            ADD CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1" FOREIGN KEY ("visit_full_form_id") REFERENCES "fc_visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature"
            ADD CONSTRAINT "FK_b00cc9e55226e4e4248c53fce23" FOREIGN KEY ("visit_full_form_id") REFERENCES "fc_visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_other_training"
            ADD CONSTRAINT "FK_f6535e6c17521baed32616f9a90" FOREIGN KEY ("visit_full_form_id") REFERENCES "fc_visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "fc_other_training" DROP CONSTRAINT "FK_f6535e6c17521baed32616f9a90"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_treatment_plan_signature" DROP CONSTRAINT "FK_b00cc9e55226e4e4248c53fce23"
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion" DROP CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1"
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
            ALTER TABLE "fc_treatment_plan_signature" DROP COLUMN "visit_full_form_id"
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
            ALTER TABLE "fc_other_training"
            ADD CONSTRAINT "FK_f6535e6c17521baed32616f9a90" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "fc_family_discussion"
            ADD CONSTRAINT "FK_bc18e1975e779b27ebe88d5d8c1" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.updateMoreVisitData1735330276884 = updateMoreVisitData1735330276884;
//# sourceMappingURL=1735330276884-updateMoreVisitData.js.map