"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitLogInitialMigration1720552184173 = void 0;
class visitLogInitialMigration1720552184173 {
    constructor() {
        this.name = 'visitLogInitialMigration1720552184173';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."session_highlights_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "session_highlights" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "location" character varying,
                "level_of_compliance" character varying,
                "injury_to_self" character varying,
                "aggression_to_others" character varying,
                "client_hospitalized_in_care_today" boolean,
                "client_placed_themselves_in_harm_by_leaving_my_care" boolean,
                "status" "public"."session_highlights_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_dfc34782987117da60a3477d7f" UNIQUE ("user_id"),
                CONSTRAINT "PK_62be3702577ca2f65122b5b694d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."self_management_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "self_management" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "responding_to_others" boolean,
                "sharing" boolean,
                "increasing_on_task_behavior" boolean,
                "initiating_interactions" boolean,
                "conversing_with_others" boolean,
                "increasing_play_skills" boolean,
                "promoting_daily_living_skills" boolean,
                "taking_turns" boolean,
                "following_the_rules" boolean,
                "reducing_occurence_of_interfering_behavior" boolean,
                "cooperate_with_peers_in_group_activity" boolean,
                "other" boolean,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "status" "public"."self_management_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_72266d85c90148c82fa787e3ee" UNIQUE ("user_id"),
                CONSTRAINT "PK_215e99df2834dcb03fa9dcf2ff6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."communication_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "communication" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "gestures" boolean,
                "written_words" boolean,
                "picture_communication_symbols" boolean,
                "objects" boolean,
                "short_phrases" boolean,
                "repetitive_phrases" boolean,
                "icons_pictures" boolean,
                "verbal_sounds" boolean,
                "type_words" boolean,
                "single_words" boolean,
                "photographs" boolean,
                "sign_language" boolean,
                "an_augmentative_communication_device" boolean,
                "picture_exchange_communication_system" boolean,
                "other" boolean,
                "other_description" text,
                "treatment_plan_id" uuid,
                "status" "public"."communication_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_3120e867d4bf41caa7b8984440" UNIQUE ("user_id"),
                CONSTRAINT "PK_392407b9e9100bee1a64e26cd5d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."behavior_management_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "behavior_management" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "behavior_type" character varying,
                "behavior_description" character varying,
                "what_time_did_behavior_occur" character varying,
                "antecedent" character varying,
                "consequence" character varying,
                "setting" character varying,
                "how_many_times_did_behavior_occur" character varying,
                "for_how_long_did_behavior_occur" character varying,
                "severity" character varying,
                "other_crisis_intervention" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "status" "public"."behavior_management_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_0cdd74ae6dc3042f7b27a3ec08" UNIQUE ("user_id"),
                CONSTRAINT "PK_c1ad03d2d0309f014a2ed5f889e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."concern_and_challenges_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "concern_and_challenges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "was_there_any_concerns_or_challenges" boolean,
                "supervisor_to_contact_during_session" boolean,
                "describe_circumstances_involved" text,
                "treatment_plan_id" uuid,
                "status" "public"."concern_and_challenges_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_fd05830f168f1089496581342a" UNIQUE ("user_id"),
                CONSTRAINT "PK_c27ea9ac84e6d2cc5eafc7a37ed" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."visit_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "visit_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "session_highlights_id" uuid,
                "self_management_id" uuid,
                "communication_id" uuid,
                "behavior_management_id" uuid,
                "concern_and_challenges_id" uuid,
                "status" "public"."visit_full_form_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "registered_by" character varying NOT NULL,
                "date_of_visit" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_af429e45b9babcaee0f1ae7e61" UNIQUE ("user_id"),
                CONSTRAINT "PK_6879cf5a9853563449429cf91a9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_17fe2478425cb181b7510749663" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_21119e1294a4a75071eb3669edf" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_dfc34782987117da60a3477d7f5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_ee03d27a606951ea8e6293a5690" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_d2c9431a3ce8a328533ee25c90c" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_72266d85c90148c82fa787e3eea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_31a32d5f6c28b33bbfbf637552b" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_d7f70752682cedc2b319e47b3c9" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_3120e867d4bf41caa7b8984440e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_d82b231c96eb53ff8ad3e1bbbb5" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_c5db9deb5c839b1499ecb403e0d" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_257d1b889bd08e13502e8c9ec68" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_12821b939e5728ec683cc14cedc" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_fd05830f168f1089496581342a3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_3660df229ee2d0daf68087668ef" FOREIGN KEY ("session_highlights_id") REFERENCES "session_highlights"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_237a2dfc9efcf26e1997a698d5e" FOREIGN KEY ("self_management_id") REFERENCES "self_management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_cef2474e0e1c15e4d296214a3ec" FOREIGN KEY ("communication_id") REFERENCES "communication"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_3f048aced48b1cf44af636a87c7" FOREIGN KEY ("behavior_management_id") REFERENCES "behavior_management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_c0aa3cb9b8331a70d1a4770c72d" FOREIGN KEY ("concern_and_challenges_id") REFERENCES "concern_and_challenges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_92695643baf123763e73fc37933" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_92695643baf123763e73fc37933"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_c0aa3cb9b8331a70d1a4770c72d"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_3f048aced48b1cf44af636a87c7"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_cef2474e0e1c15e4d296214a3ec"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_237a2dfc9efcf26e1997a698d5e"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_3660df229ee2d0daf68087668ef"
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_fd05830f168f1089496581342a3"
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_12821b939e5728ec683cc14cedc"
        `);
        await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_257d1b889bd08e13502e8c9ec68"
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086"
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_c5db9deb5c839b1499ecb403e0d"
        `);
        await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_d82b231c96eb53ff8ad3e1bbbb5"
        `);
        await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_3120e867d4bf41caa7b8984440e"
        `);
        await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_d7f70752682cedc2b319e47b3c9"
        `);
        await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_31a32d5f6c28b33bbfbf637552b"
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_72266d85c90148c82fa787e3eea"
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_d2c9431a3ce8a328533ee25c90c"
        `);
        await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_ee03d27a606951ea8e6293a5690"
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_dfc34782987117da60a3477d7f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_21119e1294a4a75071eb3669edf"
        `);
        await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_17fe2478425cb181b7510749663"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            DROP TABLE "visit_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."visit_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "concern_and_challenges"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."concern_and_challenges_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "behavior_management"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."behavior_management_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "communication"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."communication_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "self_management"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."self_management_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "session_highlights"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."session_highlights_status_enum"
        `);
    }
}
exports.visitLogInitialMigration1720552184173 = visitLogInitialMigration1720552184173;
//# sourceMappingURL=1720552184173-visitLogInitialMigration.js.map