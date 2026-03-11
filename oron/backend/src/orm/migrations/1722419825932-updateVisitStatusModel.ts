import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateVisitStatusModel1722419825932 implements MigrationInterface {
  name = 'updateVisitStatusModel1722419825932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "was_rescheduled" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user_document_status_enum"
            RENAME TO "user_document_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_document_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status" TYPE "public"."user_document_status_enum" USING "status"::"text"::"public"."user_document_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_document_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user-bio-data_status_enum"
            RENAME TO "user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" TYPE "public"."user-bio-data_status_enum" USING "status"::"text"::"public"."user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."cjis_full_form_status_enum"
            RENAME TO "cjis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."cjis_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status" TYPE "public"."cjis_full_form_status_enum" USING "status"::"text"::"public"."cjis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."cjis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."employee_personal_information_status_enum"
            RENAME TO "employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" TYPE "public"."employee_personal_information_status_enum" USING "status"::"text"::"public"."employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."flu_full_form_status_enum"
            RENAME TO "flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" TYPE "public"."flu_full_form_status_enum" USING "status"::"text"::"public"."flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum"
            RENAME TO "hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" TYPE "public"."hepatitis_b_full_form_status_enum" USING "status"::"text"::"public"."hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."i9_form_status_enum"
            RENAME TO "i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" TYPE "public"."i9_form_status_enum" USING "status"::"text"::"public"."i9_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" TYPE "public"."influenza_vaccination_declination_full_form_status_enum" USING "status"::"text"::"public"."influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."mmr_full_form_status_enum"
            RENAME TO "mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" TYPE "public"."mmr_full_form_status_enum" USING "status"::"text"::"public"."mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."n95_fit_full_form_status_enum"
            RENAME TO "n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" TYPE "public"."n95_fit_full_form_status_enum" USING "status"::"text"::"public"."n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."pneumococcal_full_form_status_enum"
            RENAME TO "pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" TYPE "public"."pneumococcal_full_form_status_enum" USING "status"::"text"::"public"."pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."treatment_full_plan_status_enum"
            RENAME TO "treatment_full_plan_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status" TYPE "public"."treatment_full_plan_status_enum" USING "status"::"text"::"public"."treatment_full_plan_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."reference_form_status_enum"
            RENAME TO "reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."reference_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" TYPE "public"."reference_form_status_enum" USING "status"::"text"::"public"."reference_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."tuberculosis_full_form_status_enum"
            RENAME TO "tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" TYPE "public"."tuberculosis_full_form_status_enum" USING "status"::"text"::"public"."tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."varicella_full_form_status_enum"
            RENAME TO "varicella_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."varicella_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" TYPE "public"."varicella_full_form_status_enum" USING "status"::"text"::"public"."varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."session_highlights_status_enum"
            RENAME TO "session_highlights_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."session_highlights_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status" TYPE "public"."session_highlights_status_enum" USING "status"::"text"::"public"."session_highlights_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."session_highlights_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."self_management_status_enum"
            RENAME TO "self_management_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."self_management_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status" TYPE "public"."self_management_status_enum" USING "status"::"text"::"public"."self_management_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."self_management_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."communication_status_enum"
            RENAME TO "communication_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."communication_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status" TYPE "public"."communication_status_enum" USING "status"::"text"::"public"."communication_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."communication_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."concern_and_challenges_status_enum"
            RENAME TO "concern_and_challenges_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."concern_and_challenges_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status" TYPE "public"."concern_and_challenges_status_enum" USING "status"::"text"::"public"."concern_and_challenges_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."concern_and_challenges_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."domestic_skill_training_status_enum"
            RENAME TO "domestic_skill_training_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."domestic_skill_training_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status" TYPE "public"."domestic_skill_training_status_enum" USING "status"::"text"::"public"."domestic_skill_training_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."domestic_skill_training_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."play_leisure_status_enum"
            RENAME TO "play_leisure_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."play_leisure_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status" TYPE "public"."play_leisure_status_enum" USING "status"::"text"::"public"."play_leisure_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."play_leisure_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."snack_meal_time_status_enum"
            RENAME TO "snack_meal_time_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."snack_meal_time_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status" TYPE "public"."snack_meal_time_status_enum" USING "status"::"text"::"public"."snack_meal_time_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."snack_meal_time_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."utilization_of_money_status_enum"
            RENAME TO "utilization_of_money_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."utilization_of_money_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status" TYPE "public"."utilization_of_money_status_enum" USING "status"::"text"::"public"."utilization_of_money_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."utilization_of_money_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."socialization_status_enum"
            RENAME TO "socialization_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."socialization_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status" TYPE "public"."socialization_status_enum" USING "status"::"text"::"public"."socialization_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."socialization_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."safety_and_survival_skills_status_enum"
            RENAME TO "safety_and_survival_skills_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."safety_and_survival_skills_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status" TYPE "public"."safety_and_survival_skills_status_enum" USING "status"::"text"::"public"."safety_and_survival_skills_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."safety_and_survival_skills_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."personal_care_bowel_and_bladder_control_status_enum"
            RENAME TO "personal_care_bowel_and_bladder_control_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_care_bowel_and_bladder_control_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status" TYPE "public"."personal_care_bowel_and_bladder_control_status_enum" USING "status"::"text"::"public"."personal_care_bowel_and_bladder_control_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_care_bowel_and_bladder_control_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."sensory_need_and_motor_development_status_enum"
            RENAME TO "sensory_need_and_motor_development_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."sensory_need_and_motor_development_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status" TYPE "public"."sensory_need_and_motor_development_status_enum" USING "status"::"text"::"public"."sensory_need_and_motor_development_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sensory_need_and_motor_development_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."personal_work_reading_status_enum"
            RENAME TO "personal_work_reading_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_work_reading_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status" TYPE "public"."personal_work_reading_status_enum" USING "status"::"text"::"public"."personal_work_reading_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_work_reading_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."visit_full_form_status_enum"
            RENAME TO "visit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."visit_full_form_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status" TYPE "public"."visit_full_form_status_enum" USING "status"::"text"::"public"."visit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'draft'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."visit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."behavior_management_status_enum"
            RENAME TO "behavior_management_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."behavior_management_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status" TYPE "public"."behavior_management_status_enum" USING "status"::"text"::"public"."behavior_management_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."behavior_management_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."visit_goal_status_enum"
            RENAME TO "visit_goal_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."visit_goal_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed',
                'completed',
                'rejected',
                'submitted',
                'draft'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status" TYPE "public"."visit_goal_status_enum" USING "status"::"text"::"public"."visit_goal_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."visit_goal_status_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."visit_goal_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status" TYPE "public"."visit_goal_status_enum_old" USING "status"::"text"::"public"."visit_goal_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_goal"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."visit_goal_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."visit_goal_status_enum_old"
            RENAME TO "visit_goal_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."behavior_management_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status" TYPE "public"."behavior_management_status_enum_old" USING "status"::"text"::"public"."behavior_management_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "behavior_management"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."behavior_management_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."behavior_management_status_enum_old"
            RENAME TO "behavior_management_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."visit_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status" TYPE "public"."visit_full_form_status_enum_old" USING "status"::"text"::"public"."visit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "visit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."visit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."visit_full_form_status_enum_old"
            RENAME TO "visit_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_work_reading_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status" TYPE "public"."personal_work_reading_status_enum_old" USING "status"::"text"::"public"."personal_work_reading_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_work_reading"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_work_reading_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."personal_work_reading_status_enum_old"
            RENAME TO "personal_work_reading_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."sensory_need_and_motor_development_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status" TYPE "public"."sensory_need_and_motor_development_status_enum_old" USING "status"::"text"::"public"."sensory_need_and_motor_development_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "sensory_need_and_motor_development"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sensory_need_and_motor_development_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."sensory_need_and_motor_development_status_enum_old"
            RENAME TO "sensory_need_and_motor_development_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."personal_care_bowel_and_bladder_control_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status" TYPE "public"."personal_care_bowel_and_bladder_control_status_enum_old" USING "status"::"text"::"public"."personal_care_bowel_and_bladder_control_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_care_bowel_and_bladder_control"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."personal_care_bowel_and_bladder_control_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."personal_care_bowel_and_bladder_control_status_enum_old"
            RENAME TO "personal_care_bowel_and_bladder_control_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."safety_and_survival_skills_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status" TYPE "public"."safety_and_survival_skills_status_enum_old" USING "status"::"text"::"public"."safety_and_survival_skills_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "safety_and_survival_skills"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."safety_and_survival_skills_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."safety_and_survival_skills_status_enum_old"
            RENAME TO "safety_and_survival_skills_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."socialization_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status" TYPE "public"."socialization_status_enum_old" USING "status"::"text"::"public"."socialization_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "socialization"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."socialization_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."socialization_status_enum_old"
            RENAME TO "socialization_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."utilization_of_money_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status" TYPE "public"."utilization_of_money_status_enum_old" USING "status"::"text"::"public"."utilization_of_money_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "utilization_of_money"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."utilization_of_money_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."utilization_of_money_status_enum_old"
            RENAME TO "utilization_of_money_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."snack_meal_time_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status" TYPE "public"."snack_meal_time_status_enum_old" USING "status"::"text"::"public"."snack_meal_time_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "snack_meal_time"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."snack_meal_time_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."snack_meal_time_status_enum_old"
            RENAME TO "snack_meal_time_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."play_leisure_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status" TYPE "public"."play_leisure_status_enum_old" USING "status"::"text"::"public"."play_leisure_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "play_leisure"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."play_leisure_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."play_leisure_status_enum_old"
            RENAME TO "play_leisure_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."domestic_skill_training_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status" TYPE "public"."domestic_skill_training_status_enum_old" USING "status"::"text"::"public"."domestic_skill_training_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "domestic_skill_training"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."domestic_skill_training_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."domestic_skill_training_status_enum_old"
            RENAME TO "domestic_skill_training_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."concern_and_challenges_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status" TYPE "public"."concern_and_challenges_status_enum_old" USING "status"::"text"::"public"."concern_and_challenges_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "concern_and_challenges"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."concern_and_challenges_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."concern_and_challenges_status_enum_old"
            RENAME TO "concern_and_challenges_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."communication_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status" TYPE "public"."communication_status_enum_old" USING "status"::"text"::"public"."communication_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "communication"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."communication_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."communication_status_enum_old"
            RENAME TO "communication_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."self_management_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status" TYPE "public"."self_management_status_enum_old" USING "status"::"text"::"public"."self_management_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "self_management"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."self_management_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."self_management_status_enum_old"
            RENAME TO "self_management_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."session_highlights_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status" TYPE "public"."session_highlights_status_enum_old" USING "status"::"text"::"public"."session_highlights_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_highlights"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."session_highlights_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."session_highlights_status_enum_old"
            RENAME TO "session_highlights_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."varicella_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status" TYPE "public"."varicella_full_form_status_enum_old" USING "status"::"text"::"public"."varicella_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."varicella_full_form_status_enum_old"
            RENAME TO "varicella_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."tuberculosis_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status" TYPE "public"."tuberculosis_full_form_status_enum_old" USING "status"::"text"::"public"."tuberculosis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."tuberculosis_full_form_status_enum_old"
            RENAME TO "tuberculosis_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."reference_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status" TYPE "public"."reference_form_status_enum_old" USING "status"::"text"::"public"."reference_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "reference_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."reference_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."reference_form_status_enum_old"
            RENAME TO "reference_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status" TYPE "public"."treatment_full_plan_status_enum_old" USING "status"::"text"::"public"."treatment_full_plan_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."treatment_full_plan_status_enum_old"
            RENAME TO "treatment_full_plan_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."pneumococcal_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status" TYPE "public"."pneumococcal_full_form_status_enum_old" USING "status"::"text"::"public"."pneumococcal_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."pneumococcal_full_form_status_enum_old"
            RENAME TO "pneumococcal_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."n95_fit_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status" TYPE "public"."n95_fit_full_form_status_enum_old" USING "status"::"text"::"public"."n95_fit_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."n95_fit_full_form_status_enum_old"
            RENAME TO "n95_fit_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mmr_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status" TYPE "public"."mmr_full_form_status_enum_old" USING "status"::"text"::"public"."mmr_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."mmr_full_form_status_enum_old"
            RENAME TO "mmr_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status" TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old" USING "status"::"text"::"public"."influenza_vaccination_declination_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."influenza_vaccination_declination_full_form_status_enum_old"
            RENAME TO "influenza_vaccination_declination_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."i9_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status" TYPE "public"."i9_form_status_enum_old" USING "status"::"text"::"public"."i9_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "i9_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."i9_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."i9_form_status_enum_old"
            RENAME TO "i9_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."hepatitis_b_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status" TYPE "public"."hepatitis_b_full_form_status_enum_old" USING "status"::"text"::"public"."hepatitis_b_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."hepatitis_b_full_form_status_enum_old"
            RENAME TO "hepatitis_b_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."flu_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status" TYPE "public"."flu_full_form_status_enum_old" USING "status"::"text"::"public"."flu_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."flu_full_form_status_enum_old"
            RENAME TO "flu_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."employee_personal_information_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status" TYPE "public"."employee_personal_information_status_enum_old" USING "status"::"text"::"public"."employee_personal_information_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."employee_personal_information_status_enum_old"
            RENAME TO "employee_personal_information_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."cjis_full_form_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status" TYPE "public"."cjis_full_form_status_enum_old" USING "status"::"text"::"public"."cjis_full_form_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "cjis_full_form"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."cjis_full_form_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."cjis_full_form_status_enum_old"
            RENAME TO "cjis_full_form_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user-bio-data_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status" TYPE "public"."user-bio-data_status_enum_old" USING "status"::"text"::"public"."user-bio-data_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user-bio-data_status_enum_old"
            RENAME TO "user-bio-data_status_enum"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_document_status_enum_old" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status" TYPE "public"."user_document_status_enum_old" USING "status"::"text"::"public"."user_document_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_document"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_document_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."user_document_status_enum_old"
            RENAME TO "user_document_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "was_rescheduled"
        `);
  }
}
