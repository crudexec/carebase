import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitColumns1721243373343 implements MigrationInterface {
  name = 'updateVisitColumns1721243373343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_dfc34782987117da60a3477d7f5"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_72266d85c90148c82fa787e3eea"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_3120e867d4bf41caa7b8984440e"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_fd05830f168f1089496581342a3"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP CONSTRAINT "FK_0b2a99d4cb1f51e67fff41c4541"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP CONSTRAINT "FK_6f377bf90eb6fd32c29aaaf64c1"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP CONSTRAINT "FK_99896c22af2f3ed04ac3f030b56"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP CONSTRAINT "FK_24f00256f6f4c96d249c4042b39"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP CONSTRAINT "FK_a2643a6bce44748d2212732a441"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP CONSTRAINT "FK_fb7df5d66735fcfb055fe7c2392"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP CONSTRAINT "FK_e9e3cac2c607d91818b1a0a6bca"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP CONSTRAINT "FK_4c6916512c1bdc697612f8065eb"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP CONSTRAINT "FK_265c9a6f67b647443eefcf28ed8"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP CONSTRAINT "FK_3b95994c1cb419ace84d5d76dd6"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "registered_by" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD "registered_by" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_8759f7a14c55a97cc13821110da" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_3e04a4754404509ea73bb75fa64" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_08d2fe0dc7f8ca5adafb20d2fbe" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_882939c572aee717520f43e5e3f" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD CONSTRAINT "FK_9f960e1e0e11e0f2c9751e1db49" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD CONSTRAINT "FK_cc565c8820d2f5b0c7af77e952e" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD CONSTRAINT "FK_c78a2d187c4116bfcd0b08219af" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD CONSTRAINT "FK_2c8bcff0aef3e06296a127a02a3" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD CONSTRAINT "FK_b0d6f890304fe1130d63d5931f0" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD CONSTRAINT "FK_07b4dd5def0072e5d581d0d82c6" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD CONSTRAINT "FK_d1d36859dbfd893bbf3b65455c2" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD CONSTRAINT "FK_ebc9ace82358d620c04be189c29" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD CONSTRAINT "FK_d9f5ed38d7aaeaaf63bd9266c04" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD CONSTRAINT "FK_b6e4324e889300c4da5d64604c1" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_a3f4b6552587588ece34b01af3c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_9d00b7028eacfa34e2717c21a64" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP CONSTRAINT "FK_9d00b7028eacfa34e2717c21a64"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP CONSTRAINT "FK_a3f4b6552587588ece34b01af3c"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP CONSTRAINT "FK_b6e4324e889300c4da5d64604c1"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP CONSTRAINT "FK_d9f5ed38d7aaeaaf63bd9266c04"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP CONSTRAINT "FK_ebc9ace82358d620c04be189c29"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP CONSTRAINT "FK_d1d36859dbfd893bbf3b65455c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP CONSTRAINT "FK_07b4dd5def0072e5d581d0d82c6"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP CONSTRAINT "FK_b0d6f890304fe1130d63d5931f0"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP CONSTRAINT "FK_2c8bcff0aef3e06296a127a02a3"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP CONSTRAINT "FK_c78a2d187c4116bfcd0b08219af"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP CONSTRAINT "FK_cc565c8820d2f5b0c7af77e952e"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP CONSTRAINT "FK_9f960e1e0e11e0f2c9751e1db49"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP CONSTRAINT "FK_882939c572aee717520f43e5e3f"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP CONSTRAINT "FK_08d2fe0dc7f8ca5adafb20d2fbe"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP CONSTRAINT "FK_3e04a4754404509ea73bb75fa64"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP CONSTRAINT "FK_8759f7a14c55a97cc13821110da"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "communication" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD "registered_by" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ADD CONSTRAINT "FK_0cdd74ae6dc3042f7b27a3ec086" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ADD CONSTRAINT "FK_af429e45b9babcaee0f1ae7e614" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ADD CONSTRAINT "FK_3b95994c1cb419ace84d5d76dd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ADD CONSTRAINT "FK_265c9a6f67b647443eefcf28ed8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ADD CONSTRAINT "FK_4c6916512c1bdc697612f8065eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ADD CONSTRAINT "FK_e9e3cac2c607d91818b1a0a6bca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ADD CONSTRAINT "FK_fb7df5d66735fcfb055fe7c2392" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ADD CONSTRAINT "FK_a2643a6bce44748d2212732a441" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ADD CONSTRAINT "FK_24f00256f6f4c96d249c4042b39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ADD CONSTRAINT "FK_99896c22af2f3ed04ac3f030b56" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ADD CONSTRAINT "FK_6f377bf90eb6fd32c29aaaf64c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ADD CONSTRAINT "FK_0b2a99d4cb1f51e67fff41c4541" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ADD CONSTRAINT "FK_fd05830f168f1089496581342a3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ADD CONSTRAINT "FK_3120e867d4bf41caa7b8984440e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ADD CONSTRAINT "FK_72266d85c90148c82fa787e3eea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ADD CONSTRAINT "FK_dfc34782987117da60a3477d7f5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
