"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respiteMigrationModel1742911081873 = void 0;
class respiteMigrationModel1742911081873 {
    constructor() {
        this.name = 'respiteMigrationModel1742911081873';
    }
    async up(queryRunner) {
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
            ALTER TYPE "public"."treatment_basic_information_treatment_plan_type_enum"
            RENAME TO "treatment_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_basic_information_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_basic_information_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_schedule_treatment_plan_type_enum"
            RENAME TO "treatment_schedule_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_schedule_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_schedule_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_schedule_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_schedule_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_full_plan_treatment_plan_type_enum"
            RENAME TO "treatment_full_plan_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_full_plan_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_full_plan_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum"
            RENAME TO "specific_needs_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."specific_needs_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_plan_documents_treatment_plan_type_enum"
            RENAME TO "treatment_plan_documents_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_plan_documents_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_plan_documents_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_plan_documents_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_plan_documents_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_goal_treatment_plan_type_enum"
            RENAME TO "treatment_goal_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_goal_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_goal_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_goal_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_goal_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_goal_signature_treatment_plan_type_enum"
            RENAME TO "treatment_goal_signature_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_goal_signature_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment',
                'Respite'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_goal_signature_treatment_plan_type_enum" USING "treatment_plan_type"::"text"::"public"."treatment_goal_signature_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_goal_signature_treatment_plan_type_enum_old"
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_goal_signature_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_goal_signature_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_goal_signature_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal_signature"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_goal_signature_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_goal_signature_treatment_plan_type_enum_old"
            RENAME TO "treatment_goal_signature_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_goal_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_goal_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_goal_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_goal_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_goal_treatment_plan_type_enum_old"
            RENAME TO "treatment_goal_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_plan_documents_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_plan_documents_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_plan_documents_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_plan_documents"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_plan_documents_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_plan_documents_treatment_plan_type_enum_old"
            RENAME TO "treatment_plan_documents_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."specific_needs_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum_old"
            RENAME TO "specific_needs_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_full_plan_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_full_plan_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_full_plan_treatment_plan_type_enum_old"
            RENAME TO "treatment_full_plan_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_schedule_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_schedule_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_schedule_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_schedule_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_schedule_treatment_plan_type_enum_old"
            RENAME TO "treatment_schedule_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."treatment_basic_information_treatment_plan_type_enum_old" AS ENUM(
                'ALP_Assessment',
                'FC_Assessment',
                'IISS_Assessment',
                'ITI_Assessment'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type" TYPE "public"."treatment_basic_information_treatment_plan_type_enum_old" USING "treatment_plan_type"::"text"::"public"."treatment_basic_information_treatment_plan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ALTER COLUMN "treatment_plan_type"
            SET DEFAULT 'IISS_Assessment'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."treatment_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."treatment_basic_information_treatment_plan_type_enum_old"
            RENAME TO "treatment_basic_information_treatment_plan_type_enum"
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
    }
}
exports.respiteMigrationModel1742911081873 = respiteMigrationModel1742911081873;
//# sourceMappingURL=1742911081873-respiteMigrationModel.js.map