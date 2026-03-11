"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specificNeedsForIntake1741720144692 = void 0;
class specificNeedsForIntake1741720144692 {
    constructor() {
        this.name = 'specificNeedsForIntake1741720144692';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "specific_needs_current_need_or_support" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "current_needs" jsonb,
                "intake_full_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_edfea7c8fee77e397bfd55d3973" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "specific_needs_authorization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "creator_name" character varying,
                "signature_confirmation" boolean NOT NULL DEFAULT false,
                "signature_url" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "intake_full_id" uuid,
                CONSTRAINT "PK_def9b12b74906244f4d9617abef" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."specific_needs_basic_information_gender_enum" AS ENUM('female', 'male', 'no_preference')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum" AS ENUM(
                'IISS_Assessment',
                'FC_Assessment',
                'ITI_Assessment',
                'ALP_Assessment'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "specific_needs_basic_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "participant_first_name" character varying,
                "participant_last_name" character varying,
                "participant_father_name" character varying,
                "participant_mother_name" character varying,
                "gender" "public"."specific_needs_basic_information_gender_enum",
                "date_of_birth" TIMESTAMP,
                "father_mobile_number" character varying,
                "mother_mobile_number" character varying,
                "home_address" character varying,
                "treatment_plan_type" "public"."specific_needs_basic_information_treatment_plan_type_enum" DEFAULT 'IISS_Assessment',
                "specific_needs_implemented_by" character varying,
                "intake_full_id" uuid,
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_01eabce8f34992f8769259d5a07" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "specific_needs_service_needs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "iiss" boolean NOT NULL DEFAULT false,
                "therapeutic_services" boolean NOT NULL DEFAULT false,
                "respite" boolean NOT NULL DEFAULT false,
                "family_training" boolean NOT NULL DEFAULT false,
                "transport_to_school_morning" boolean NOT NULL DEFAULT false,
                "transport_from_school_to_ti" boolean NOT NULL DEFAULT false,
                "transport_from_ti_to_home" boolean NOT NULL DEFAULT false,
                "transport_to_community" boolean NOT NULL DEFAULT false,
                "no_supervision_needed" boolean NOT NULL DEFAULT false,
                "supervision_needed" boolean NOT NULL DEFAULT false,
                "harness_needed" boolean NOT NULL DEFAULT false,
                "has_preferred_caregiver" boolean NOT NULL DEFAULT false,
                "preferred_caregiver_name" character varying,
                "preferred_caregiver_phone" character varying,
                "preferred_caregiver_phone_country" character varying,
                "intake_full_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_c06559d3ac5b5d49be3bcdbc4cf" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."specific_needs_full_form_status_enum" AS ENUM(
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
            CREATE TABLE "specific_needs_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "basic_information_id" uuid,
                "service_needs_id" uuid,
                "current_need_or_support_id" uuid,
                "authorization_id" uuid,
                "intake_full_id" uuid,
                "status" "public"."specific_needs_full_form_status_enum" NOT NULL DEFAULT 'draft',
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_bb03ee3b4fbfb807e6cc922c210" PRIMARY KEY ("id")
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
            ALTER TABLE "specific_needs_current_need_or_support"
            ADD CONSTRAINT "FK_deaacc42c7355056ace198ba777" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_authorization"
            ADD CONSTRAINT "FK_021c75563660bb6b7aa3bc5aff9" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ADD CONSTRAINT "FK_3fededc0bf33f87cf240b3db9ad" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information"
            ADD CONSTRAINT "FK_26e71295a35165bbfd812c28ef3" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_service_needs"
            ADD CONSTRAINT "FK_66ad97669e3133f6a76c278a731" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_d5373542c63f5c1b4b5e3fd66f2" FOREIGN KEY ("basic_information_id") REFERENCES "specific_needs_basic_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_309589cbe83452a78b765bb7610" FOREIGN KEY ("service_needs_id") REFERENCES "specific_needs_service_needs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_14d674608c95ca59c3e59e2d6f7" FOREIGN KEY ("current_need_or_support_id") REFERENCES "specific_needs_current_need_or_support"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_2c83219644b7196f88068c10ad1" FOREIGN KEY ("authorization_id") REFERENCES "specific_needs_authorization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_c5d0d37970608ad2ab2a41f37f5" FOREIGN KEY ("intake_full_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form"
            ADD CONSTRAINT "FK_4ec11c0e77d4a07e94651700e30" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_4ec11c0e77d4a07e94651700e30"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_c5d0d37970608ad2ab2a41f37f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_2c83219644b7196f88068c10ad1"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_14d674608c95ca59c3e59e2d6f7"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_309589cbe83452a78b765bb7610"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_full_form" DROP CONSTRAINT "FK_d5373542c63f5c1b4b5e3fd66f2"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_service_needs" DROP CONSTRAINT "FK_66ad97669e3133f6a76c278a731"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information" DROP CONSTRAINT "FK_26e71295a35165bbfd812c28ef3"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_basic_information" DROP CONSTRAINT "FK_3fededc0bf33f87cf240b3db9ad"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_authorization" DROP CONSTRAINT "FK_021c75563660bb6b7aa3bc5aff9"
        `);
        await queryRunner.query(`
            ALTER TABLE "specific_needs_current_need_or_support" DROP CONSTRAINT "FK_deaacc42c7355056ace198ba777"
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
            DROP TABLE "specific_needs_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."specific_needs_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "specific_needs_service_needs"
        `);
        await queryRunner.query(`
            DROP TABLE "specific_needs_basic_information"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."specific_needs_basic_information_treatment_plan_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."specific_needs_basic_information_gender_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "specific_needs_authorization"
        `);
        await queryRunner.query(`
            DROP TABLE "specific_needs_current_need_or_support"
        `);
    }
}
exports.specificNeedsForIntake1741720144692 = specificNeedsForIntake1741720144692;
//# sourceMappingURL=1741720144692-specificNeedsForIntake.js.map