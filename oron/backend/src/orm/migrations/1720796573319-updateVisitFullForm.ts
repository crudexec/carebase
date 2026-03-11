import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitFullForm1720796573319 implements MigrationInterface {
  name = 'updateVisitFullForm1720796573319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_3f048aced48b1cf44af636a87c7"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."domestic_skill_training_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "domestic_skill_training" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "assist_to_make_bed" boolean,
                "assist_to_dust_furniture" boolean,
                "assist_to_vacuum" boolean,
                "assist_to_arrange_clothes" boolean,
                "assist_to_laundry" boolean,
                "assist_to_do_dishes" boolean,
                "assist_to_remove_trash" boolean,
                "assist_to_fold_clothes" boolean,
                "other" boolean,
                "specify_other" text,
                "status" "public"."domestic_skill_training_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_4ba5961206ab58a5479ee2744ee" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."play_leisure_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "play_leisure" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "puzzle" boolean,
                "dance" boolean,
                "arts_and_crafts" boolean,
                "listen_to_music" boolean,
                "icons_or_pictures" boolean,
                "computer_games" boolean,
                "short_naps" boolean,
                "other" boolean,
                "other_specify" text,
                "status" "public"."play_leisure_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_502840283cce9afa8fda23a8e79" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."snack_meal_time_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "snack_meal_time" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ate_all_meal_or_snack" boolean,
                "ate_some_meal_or_snack" boolean,
                "refused_all_meal_or_snack" boolean,
                "drank_a_lot_of_water" boolean,
                "drank_some_water" boolean,
                "refused_all_water" boolean,
                "drank_a_lot_of_juice" boolean,
                "drank_some_juice" boolean,
                "refused_all_juice" boolean,
                "specify_what_snack_or_meal_provided" character varying,
                "prepared_snack_or_meal" boolean,
                "served_snack_or_meal" boolean,
                "assisted_with_feeding" boolean,
                "clean_up_after_snack_or_meal" boolean,
                "other" boolean,
                "specify_other" text,
                "client_helped_to_clean_up_and_put_away_dishes" boolean,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "status" "public"."snack_meal_time_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_f140af3ade2cde127ca6aea1595" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."utilization_of_money_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "utilization_of_money" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "handing_bills_to_cashier" boolean,
                "waiting_for_and_receiving_debit_credit_card" boolean,
                "handing_coins_to_cashier" boolean,
                "counting_the_change_to_make_sure_it_is_correct" boolean,
                "handing_debit_credit_card_to_cashier" boolean,
                "determining_and_handling_the_correct_estimated_amount" boolean,
                "using_the_dollar_up_program" boolean,
                "obtaining_and_reviewing_receipt_for_accuracy" boolean,
                "waiting_for_and_accepting_the_change" boolean,
                "this_activity_occured_at" text,
                "status" "public"."utilization_of_money_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_4ec07b87908ca735c6454e65d07" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."socialization_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "socialization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "birthday_party" boolean,
                "communication_session" boolean,
                "social_group" boolean,
                "music_dance_group" boolean,
                "other_social_setting" boolean,
                "specify_other_social_setting" text,
                "play_at_the_park" boolean,
                "basketball" boolean,
                "watch_movie" boolean,
                "bowling" boolean,
                "swimming" boolean,
                "other_recreation" boolean,
                "specify_other_recreation" text,
                "visit_to_the_library" boolean,
                "visit_to_the_museum" boolean,
                "visit_to_the_zoo" boolean,
                "visit_to_the_shopping_mall" boolean,
                "visit_to_the_post_office" boolean,
                "other_community_integration" boolean,
                "specify_other_community_integration" text,
                "status" "public"."socialization_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_3807f2a98f671e7d4caa1fd1787" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."safety_and_survival_skills_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "safety_and_survival_skills" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "cross_the_street" boolean,
                "awareness_of_strangers" boolean,
                "fire_emergency_awareness" boolean,
                "unlock_door_when_trapped_in_a_room" boolean,
                "other" boolean,
                "specify_other" text,
                "status" "public"."safety_and_survival_skills_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_c6bed01dfc966d0a133adfbafe8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_care_bowel_and_bladder_control_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "personal_care_bowel_and_bladder_control" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_name_used_bathroom_without_assistance" boolean,
                "assisted_client_with_changing_diapers" boolean,
                "assisted_client_with_toileting" boolean,
                "other_bowel" boolean,
                "other_specify_bowel" text,
                "supported_client_with_shampooing" boolean,
                "supported_client_with_brushing_teeth" boolean,
                "supported_client_with_bathing" boolean,
                "supported_client_with_toweling" boolean,
                "supported_client_with_showering" boolean,
                "supported_client_with_menstrual_care" boolean,
                "other_personal_hygiene" boolean,
                "other_specify_personal_hygiene" text,
                "status" "public"."personal_care_bowel_and_bladder_control_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_4b0fc4929724d96cdba8b99983d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."sensory_need_and_motor_development_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "sensory_need_and_motor_development" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "paste_objects" boolean,
                "copy_simple_shapes" boolean,
                "turn_pages_of_book" boolean,
                "button_a_shirt" boolean,
                "use_of_cutlery" boolean,
                "cut_simple_shapes" boolean,
                "use_pencil_and_crayons_well" boolean,
                "zip_a_zipper" boolean,
                "handle_scissors_well" boolean,
                "play_musical_instruments" boolean,
                "match_simple_objects" boolean,
                "complete_simple_puzzles" boolean,
                "build_with_blocks" boolean,
                "other_error_motor_development_skills" boolean,
                "other_error_specify_motor_development_skills" text,
                "throw_a_ball" boolean,
                "kick_using_balls" boolean,
                "roll_balls_with_hand_or_foot" boolean,
                "skip_in_circles" boolean,
                "hang_clothes" boolean,
                "go_down_slides" boolean,
                "climb_ladders" boolean,
                "walk_a_straight_line" boolean,
                "jump_rope" boolean,
                "run_around_objects" boolean,
                "toss_a_ball" boolean,
                "walk_backwards" boolean,
                "balance_on_one_foot" boolean,
                "going_up_and_down_steps" boolean,
                "pump_legs_on_the_swing_at_a_playground" boolean,
                "other_gross_motor_skills" boolean,
                "other_specify_gross_motor_skills" text,
                "status" "public"."sensory_need_and_motor_development_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_3c4fe9baf6b3509bb8e83fb807c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_work_reading_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "personal_work_reading" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "grammar" boolean,
                "writing_skills" boolean,
                "vocabulary" boolean,
                "reading_comprehension" boolean,
                "algebra" boolean,
                "geometry" boolean,
                "measurement" boolean,
                "number_operations" boolean,
                "other" boolean,
                "other_specify" text,
                "i_read_a_book_to_client" boolean,
                "status" "public"."personal_work_reading_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_912f3ed09ee5ddbfcd83f1724c3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."visit_goal_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "visit_goal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "where_was_the_activity_practiced" text,
                "indicate_circumstances_leading_to_activity" text,
                "client_response_or_reaction_was" text,
                "consequently_client_did" text,
                "total_time_spent_on_activity" text,
                "client_reward" text,
                "goal_steps" text,
                "additional_comments" text,
                "status" "public"."visit_goal_status_enum" DEFAULT 'not_started',
                "account_id" character varying,
                "treatment_plan_id" uuid,
                "visit_full_form_id" uuid,
                "registered_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "PK_faae9276c7faec5bd4acbc3dc83" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "behavior_management_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "behavior_management_ids" text
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "domestic_skill_training_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "play_leisure_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "snack_meal_time_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "utilization_of_money_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "socialization_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "safety_and_survival_skills_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "personal_care_and_bladder_control_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "sensory_need_and_motor_development_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "personal_work_reading_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "visit_goal_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "UQ_e8f57eac64e41f2385e491f6342"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "UQ_78bba6cc63e13e0f901da71e341"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_dfc34782987117da60a3477d7f5"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "REL_dfc34782987117da60a3477d7f"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_72266d85c90148c82fa787e3eea"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "REL_72266d85c90148c82fa787e3ee"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_3120e867d4bf41caa7b8984440e"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "REL_3120e867d4bf41caa7b8984440"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_fd05830f168f1089496581342a3"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "REL_fd05830f168f1089496581342a"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "REL_af429e45b9babcaee0f1ae7e61"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "REL_0cdd74ae6dc3042f7b27a3ec08"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_dfc34782987117da60a3477d7f5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_72266d85c90148c82fa787e3eea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_3120e867d4bf41caa7b8984440e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_fd05830f168f1089496581342a3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD CONSTRAINT "FK_71a30446c5afd428bb46ba87d74" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD CONSTRAINT "FK_df0eb5817ae42a3d611e15b8f1b" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD CONSTRAINT "FK_0b2a99d4cb1f51e67fff41c4541" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD CONSTRAINT "FK_06668aed738f348f99a26876790" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD CONSTRAINT "FK_deaffc9b84112393cd5e80ea09d" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD CONSTRAINT "FK_6f377bf90eb6fd32c29aaaf64c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD CONSTRAINT "FK_49254b303db55f8a9dfe010176a" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD CONSTRAINT "FK_2043cf5a49df56ce0d31b8c9c91" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD CONSTRAINT "FK_99896c22af2f3ed04ac3f030b56" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD CONSTRAINT "FK_e66914f8fbc381b5afcc47ab585" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD CONSTRAINT "FK_1974093636ea302a25630cdcfc1" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD CONSTRAINT "FK_24f00256f6f4c96d249c4042b39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD CONSTRAINT "FK_35e3a6b52035bbfdc1f549407f0" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD CONSTRAINT "FK_cb981986fc10347bd1a535fe6d3" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD CONSTRAINT "FK_a2643a6bce44748d2212732a441" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD CONSTRAINT "FK_590309f218d08c4bf488c35f263" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD CONSTRAINT "FK_bd07b844d9cbc34c37876f36b6c" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD CONSTRAINT "FK_fb7df5d66735fcfb055fe7c2392" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD CONSTRAINT "FK_4c2d3efa4c3204b66a21e75386a" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD CONSTRAINT "FK_68a6e4e3766abc2d8ddd7c4ef81" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD CONSTRAINT "FK_e9e3cac2c607d91818b1a0a6bca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD CONSTRAINT "FK_7f98d3bf2baa859f4161188f52b" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD CONSTRAINT "FK_38837eea8babd99b39e75b18cd2" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD CONSTRAINT "FK_4c6916512c1bdc697612f8065eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD CONSTRAINT "FK_fc102ab521c78f7ba4fccc78b8d" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD CONSTRAINT "FK_9ea7f0e903013270679f5f05253" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD CONSTRAINT "FK_265c9a6f67b647443eefcf28ed8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD CONSTRAINT "FK_86e137ea8b696013b9f3336982d" FOREIGN KEY ("treatment_plan_id") REFERENCES "treatment_full_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD CONSTRAINT "FK_f6d64ba0d8de1a0b16553905208" FOREIGN KEY ("visit_full_form_id") REFERENCES "visit_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD CONSTRAINT "FK_3b95994c1cb419ace84d5d76dd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_f509ea13394fd891bf3631fec83" FOREIGN KEY ("domestic_skill_training_id") REFERENCES "domestic_skill_training"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_486a4fa03dc787dd9f7aa094372" FOREIGN KEY ("play_leisure_id") REFERENCES "play_leisure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_a3526d29a311f90d96fa03e728d" FOREIGN KEY ("snack_meal_time_id") REFERENCES "snack_meal_time"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_a84429b4b00101834bab35dfcfe" FOREIGN KEY ("utilization_of_money_id") REFERENCES "utilization_of_money"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_688e44fa1f25351e37057876e62" FOREIGN KEY ("socialization_id") REFERENCES "socialization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_5359f7eb8dad47003f9f6262363" FOREIGN KEY ("safety_and_survival_skills_id") REFERENCES "safety_and_survival_skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_a7e650b2713a38f5b2af203986d" FOREIGN KEY ("personal_care_and_bladder_control_id") REFERENCES "personal_care_bowel_and_bladder_control"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_c109e28ffbe22cec845164d81ce" FOREIGN KEY ("sensory_need_and_motor_development_id") REFERENCES "sensory_need_and_motor_development"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_b9985a21278b8670ecbb696ec7e" FOREIGN KEY ("personal_work_reading_id") REFERENCES "personal_work_reading"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b" FOREIGN KEY ("visit_goal_id") REFERENCES "visit_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_082d9cfc3cf2dd9c8b31585074b"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_b9985a21278b8670ecbb696ec7e"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_c109e28ffbe22cec845164d81ce"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_a7e650b2713a38f5b2af203986d"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_5359f7eb8dad47003f9f6262363"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_688e44fa1f25351e37057876e62"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_a84429b4b00101834bab35dfcfe"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_a3526d29a311f90d96fa03e728d"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_486a4fa03dc787dd9f7aa094372"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_f509ea13394fd891bf3631fec83"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP CONSTRAINT "FK_3b95994c1cb419ace84d5d76dd6"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP CONSTRAINT "FK_f6d64ba0d8de1a0b16553905208"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP CONSTRAINT "FK_86e137ea8b696013b9f3336982d"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP CONSTRAINT "FK_265c9a6f67b647443eefcf28ed8"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP CONSTRAINT "FK_9ea7f0e903013270679f5f05253"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP CONSTRAINT "FK_fc102ab521c78f7ba4fccc78b8d"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP CONSTRAINT "FK_4c6916512c1bdc697612f8065eb"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP CONSTRAINT "FK_38837eea8babd99b39e75b18cd2"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP CONSTRAINT "FK_7f98d3bf2baa859f4161188f52b"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP CONSTRAINT "FK_e9e3cac2c607d91818b1a0a6bca"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP CONSTRAINT "FK_68a6e4e3766abc2d8ddd7c4ef81"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP CONSTRAINT "FK_4c2d3efa4c3204b66a21e75386a"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP CONSTRAINT "FK_fb7df5d66735fcfb055fe7c2392"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP CONSTRAINT "FK_bd07b844d9cbc34c37876f36b6c"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP CONSTRAINT "FK_590309f218d08c4bf488c35f263"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP CONSTRAINT "FK_a2643a6bce44748d2212732a441"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP CONSTRAINT "FK_cb981986fc10347bd1a535fe6d3"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP CONSTRAINT "FK_35e3a6b52035bbfdc1f549407f0"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP CONSTRAINT "FK_24f00256f6f4c96d249c4042b39"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP CONSTRAINT "FK_1974093636ea302a25630cdcfc1"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP CONSTRAINT "FK_e66914f8fbc381b5afcc47ab585"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP CONSTRAINT "FK_99896c22af2f3ed04ac3f030b56"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP CONSTRAINT "FK_2043cf5a49df56ce0d31b8c9c91"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP CONSTRAINT "FK_49254b303db55f8a9dfe010176a"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP CONSTRAINT "FK_6f377bf90eb6fd32c29aaaf64c1"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP CONSTRAINT "FK_deaffc9b84112393cd5e80ea09d"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP CONSTRAINT "FK_06668aed738f348f99a26876790"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP CONSTRAINT "FK_0b2a99d4cb1f51e67fff41c4541"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP CONSTRAINT "FK_df0eb5817ae42a3d611e15b8f1b"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP CONSTRAINT "FK_71a30446c5afd428bb46ba87d74"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_fd05830f168f1089496581342a3"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_3120e867d4bf41caa7b8984440e"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_72266d85c90148c82fa787e3eea"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_dfc34782987117da60a3477d7f5"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "REL_0cdd74ae6dc3042f7b27a3ec08" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "REL_af429e45b9babcaee0f1ae7e61" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "REL_fd05830f168f1089496581342a" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_fd05830f168f1089496581342a3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "REL_3120e867d4bf41caa7b8984440" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_3120e867d4bf41caa7b8984440e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "REL_72266d85c90148c82fa787e3ee" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_72266d85c90148c82fa787e3eea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "REL_dfc34782987117da60a3477d7f" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_dfc34782987117da60a3477d7f5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD CONSTRAINT "UQ_78bba6cc63e13e0f901da71e341" UNIQUE ("medicaid_number")
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD CONSTRAINT "UQ_e8f57eac64e41f2385e491f6342" UNIQUE ("social_security_number")
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "visit_goal_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "personal_work_reading_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "sensory_need_and_motor_development_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "personal_care_and_bladder_control_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "safety_and_survival_skills_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "socialization_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "utilization_of_money_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "snack_meal_time_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "play_leisure_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "domestic_skill_training_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "behavior_management_ids"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "behavior_management_id" uuid
        `);
    await queryRunner.query(`
            DROP TABLE "visit_goal"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."visit_goal_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "personal_work_reading"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_work_reading_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "sensory_need_and_motor_development"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sensory_need_and_motor_development_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "personal_care_bowel_and_bladder_control"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_care_bowel_and_bladder_control_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "safety_and_survival_skills"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."safety_and_survival_skills_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "socialization"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."socialization_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "utilization_of_money"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."utilization_of_money_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "snack_meal_time"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."snack_meal_time_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "play_leisure"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."play_leisure_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "domestic_skill_training"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."domestic_skill_training_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_3f048aced48b1cf44af636a87c7" FOREIGN KEY ("behavior_management_id") REFERENCES "behavior_management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
