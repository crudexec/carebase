import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateIntakeAndTreatmentPlanModel1718741473302 implements MigrationInterface {
  name = 'updateIntakeAndTreatmentPlanModel1718741473302';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "waiver_services" DROP CONSTRAINT "FK_bfca19dd247089f0626b5586a0c"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information" DROP CONSTRAINT "FK_153d1af19d33b8a8f75aabec7b2"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information" DROP CONSTRAINT "FK_6a27ff5d3f976ee8727f8ee3f4e"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "FK_79bf08349d58880a977c2fc5700"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information" DROP CONSTRAINT "FK_58b55c6d3132cec109e36b6d14d"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information" DROP CONSTRAINT "FK_32533ecf511d436354bb65421e3"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP CONSTRAINT "FK_bd287d06a46934c6500f5dda018"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information" DROP CONSTRAINT "FK_5159b1227d265354070287f1b17"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information" DROP CONSTRAINT "FK_0f89335855cfc3048e61b046e4f"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information" DROP CONSTRAINT "FK_a40d7c9e1ec1c6afefb3621962f"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information" DROP CONSTRAINT "FK_f30c613cf5704e9187eba1b8858"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8d190882ee14fb913b3c4362e82"
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
                RENAME CONSTRAINT "REL_153d1af19d33b8a8f75aabec7b" TO "UQ_4f6b735bbf5acf5de6f0621e666"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
                RENAME CONSTRAINT "REL_6a27ff5d3f976ee8727f8ee3f4" TO "UQ_6986ec7fcffbe01bc1160e7bcc9"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
                RENAME CONSTRAINT "REL_79bf08349d58880a977c2fc570" TO "UQ_4760b53a6a820b09380ec6d9ad7"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
                RENAME CONSTRAINT "REL_58b55c6d3132cec109e36b6d14" TO "UQ_c3369adae33ef8d50367907fb67"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
                RENAME CONSTRAINT "REL_32533ecf511d436354bb65421e" TO "UQ_86376ebc728071f56de65cf072c"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
                RENAME CONSTRAINT "REL_bd287d06a46934c6500f5dda01" TO "UQ_9ae112d58b0710de731f1fa4066"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
                RENAME CONSTRAINT "REL_5159b1227d265354070287f1b1" TO "UQ_ecf191710cf292775321de71ac8"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
                RENAME CONSTRAINT "REL_0f89335855cfc3048e61b046e4" TO "UQ_72eb14bf70cdc097f1313d90e8d"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
                RENAME CONSTRAINT "REL_a40d7c9e1ec1c6afefb3621962" TO "UQ_94d4c1b5db2053044218ad4a9fe"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
                RENAME CONSTRAINT "REL_f30c613cf5704e9187eba1b885" TO "UQ_62cab2ee4971b17f70ea9dbd131"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
                RENAME COLUMN "user_id" TO "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
                RENAME CONSTRAINT "REL_8d190882ee14fb913b3c4362e8" TO "UQ_8815bad5c762d79feacd3d21d7f"
        `);
    await queryRunner.query(`
            CREATE TABLE "intake_emergency_contact_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "relationship" character varying,
                "email" character varying,
                "street_number_and_house_address" character varying,
                "country" character varying,
                "state" character varying,
                "city" character varying,
                "zip_code" character varying,
                "apartment_number" character varying,
                "phone" character varying,
                "home_phone_number" character varying,
                "work_phone_number" character varying,
                "registered_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_24b90e2ad32dc19d8f19f381c2e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "treatment_basic_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "participant_first_name" character varying,
                "participant_last_name" character varying,
                "participant_father_name" character varying,
                "participant_mother_name" character varying,
                "father_mobile_number" character varying,
                "mother_mobile_number" character varying,
                "address_street_information" character varying,
                "country" character varying,
                "state" character varying,
                "city" character varying,
                "apartment_number" character varying,
                "zip_code" character varying,
                "implementation_start_date" TIMESTAMP,
                "implementation_stop_date" TIMESTAMP,
                "participant_background_information" text,
                "behavior_intervention_protocol" text,
                "transport_requirements_and_recommendations" text,
                "phone" character varying,
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_f4d4ba4844ab2a8259b6bd28065" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "treatment_goal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "goal_area" character varying,
                "target_skill" character varying,
                "short_term_objective" character varying,
                "objective_term_steps" text,
                "goal_status" character varying,
                "goal_setting" character varying,
                "number_of_trials" integer,
                "goal_frequency" character varying,
                "current_skill_level" character varying,
                "target_performance_level" character varying,
                "goal_background" text,
                "goal_statement" text,
                "implementation_procedure" text,
                "treatment_plan_id" character varying,
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_65396c5c3080a41e525d343c50b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "treatment_schedule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "start_date" TIMESTAMP,
                "end_date" TIMESTAMP,
                "google_calendar_event_id" character varying,
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_423c18414f8b533a6f4e4b3240f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."treatment_full_plan_status_enum" AS ENUM(
                'not_started',
                'in_progress',
                'awaiting_approval',
                'approved',
                'reviewed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "treatment_full_plan" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "basic_information_id" uuid,
                "treatment_goal_id" uuid,
                "treatment_schedule_id" uuid,
                "status" "public"."treatment_full_plan_status_enum" DEFAULT 'not_started',
                "registered_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_5cee128444602e7d0b6ee80d91" UNIQUE ("basic_information_id"),
                CONSTRAINT "REL_5593336e376592b8f2c915a607" UNIQUE ("treatment_goal_id"),
                CONSTRAINT "REL_6daa72e0575556147359ea2a24" UNIQUE ("treatment_schedule_id"),
                CONSTRAINT "PK_b1c14be1a1cdfab068fec2fdadd" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
    await queryRunner.query(`
            ALTER TABLE "people_present_information"
            ADD "registered_by" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ALTER COLUMN "registered_by" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information" DROP CONSTRAINT "UQ_4f6b735bbf5acf5de6f0621e666"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information" DROP CONSTRAINT "UQ_6986ec7fcffbe01bc1160e7bcc9"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "UQ_4760b53a6a820b09380ec6d9ad7"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information" DROP CONSTRAINT "UQ_c3369adae33ef8d50367907fb67"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information" DROP CONSTRAINT "UQ_86376ebc728071f56de65cf072c"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP CONSTRAINT "UQ_9ae112d58b0710de731f1fa4066"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information" DROP CONSTRAINT "UQ_ecf191710cf292775321de71ac8"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information" DROP CONSTRAINT "UQ_72eb14bf70cdc097f1313d90e8d"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information" DROP CONSTRAINT "UQ_94d4c1b5db2053044218ad4a9fe"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information" DROP CONSTRAINT "UQ_62cab2ee4971b17f70ea9dbd131"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "UQ_8815bad5c762d79feacd3d21d7f"
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ADD CONSTRAINT "FK_a963bca2e2f095797aebfe0d1d5" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
            ADD CONSTRAINT "FK_4f6b735bbf5acf5de6f0621e666" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
            ADD CONSTRAINT "FK_6986ec7fcffbe01bc1160e7bcc9" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD CONSTRAINT "FK_4760b53a6a820b09380ec6d9ad7" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information"
            ADD CONSTRAINT "FK_6421d21ea995c6f5a73f346a945" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "people_present_information"
            ADD CONSTRAINT "FK_36f311295b7ea0e102ed91e4f4a" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
            ADD CONSTRAINT "FK_c3369adae33ef8d50367907fb67" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
            ADD CONSTRAINT "FK_86376ebc728071f56de65cf072c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ADD CONSTRAINT "FK_9ae112d58b0710de731f1fa4066" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
            ADD CONSTRAINT "FK_ecf191710cf292775321de71ac8" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
            ADD CONSTRAINT "FK_72eb14bf70cdc097f1313d90e8d" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
            ADD CONSTRAINT "FK_94d4c1b5db2053044218ad4a9fe" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
            ADD CONSTRAINT "FK_62cab2ee4971b17f70ea9dbd131" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20" FOREIGN KEY ("emergency_contact_information_id") REFERENCES "intake_emergency_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8815bad5c762d79feacd3d21d7f" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information"
            ADD CONSTRAINT "FK_247d984e57820d3728ab6e6972c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal"
            ADD CONSTRAINT "FK_4abfcdc70afc35e23dfbbb4f65c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule"
            ADD CONSTRAINT "FK_f010763f526104ae26bf8304821" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c" FOREIGN KEY ("basic_information_id") REFERENCES "treatment_basic_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_5593336e376592b8f2c915a607c" FOREIGN KEY ("treatment_goal_id") REFERENCES "treatment_goal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_6daa72e0575556147359ea2a24f" FOREIGN KEY ("treatment_schedule_id") REFERENCES "treatment_schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan"
            ADD CONSTRAINT "FK_606af1fe8cc4a032fcdb4f34c4c" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_606af1fe8cc4a032fcdb4f34c4c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_6daa72e0575556147359ea2a24f"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5593336e376592b8f2c915a607c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_full_plan" DROP CONSTRAINT "FK_5cee128444602e7d0b6ee80d91c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_schedule" DROP CONSTRAINT "FK_f010763f526104ae26bf8304821"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_goal" DROP CONSTRAINT "FK_4abfcdc70afc35e23dfbbb4f65c"
        `);
    await queryRunner.query(`
            ALTER TABLE "treatment_basic_information" DROP CONSTRAINT "FK_247d984e57820d3728ab6e6972c"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8815bad5c762d79feacd3d21d7f"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information" DROP CONSTRAINT "FK_62cab2ee4971b17f70ea9dbd131"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information" DROP CONSTRAINT "FK_94d4c1b5db2053044218ad4a9fe"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information" DROP CONSTRAINT "FK_72eb14bf70cdc097f1313d90e8d"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information" DROP CONSTRAINT "FK_ecf191710cf292775321de71ac8"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP CONSTRAINT "FK_9ae112d58b0710de731f1fa4066"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information" DROP CONSTRAINT "FK_86376ebc728071f56de65cf072c"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information" DROP CONSTRAINT "FK_c3369adae33ef8d50367907fb67"
        `);
    await queryRunner.query(`
            ALTER TABLE "people_present_information" DROP CONSTRAINT "FK_36f311295b7ea0e102ed91e4f4a"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_emergency_contact_information" DROP CONSTRAINT "FK_6421d21ea995c6f5a73f346a945"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "FK_4760b53a6a820b09380ec6d9ad7"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information" DROP CONSTRAINT "FK_6986ec7fcffbe01bc1160e7bcc9"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information" DROP CONSTRAINT "FK_4f6b735bbf5acf5de6f0621e666"
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services" DROP CONSTRAINT "FK_a963bca2e2f095797aebfe0d1d5"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "UQ_8815bad5c762d79feacd3d21d7f" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
            ADD CONSTRAINT "UQ_62cab2ee4971b17f70ea9dbd131" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
            ADD CONSTRAINT "UQ_94d4c1b5db2053044218ad4a9fe" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
            ADD CONSTRAINT "UQ_72eb14bf70cdc097f1313d90e8d" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
            ADD CONSTRAINT "UQ_ecf191710cf292775321de71ac8" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ADD CONSTRAINT "UQ_9ae112d58b0710de731f1fa4066" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
            ADD CONSTRAINT "UQ_86376ebc728071f56de65cf072c" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
            ADD CONSTRAINT "UQ_c3369adae33ef8d50367907fb67" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD CONSTRAINT "UQ_4760b53a6a820b09380ec6d9ad7" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
            ADD CONSTRAINT "UQ_6986ec7fcffbe01bc1160e7bcc9" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
            ADD CONSTRAINT "UQ_4f6b735bbf5acf5de6f0621e666" UNIQUE ("registered_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ALTER COLUMN "registered_by"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "people_present_information" DROP COLUMN "registered_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
    await queryRunner.query(`
            DROP TABLE "treatment_full_plan"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."treatment_full_plan_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "treatment_schedule"
        `);
    await queryRunner.query(`
            DROP TABLE "treatment_goal"
        `);
    await queryRunner.query(`
            DROP TABLE "treatment_basic_information"
        `);
    await queryRunner.query(`
            DROP TABLE "intake_emergency_contact_information"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
                RENAME CONSTRAINT "UQ_8815bad5c762d79feacd3d21d7f" TO "REL_8d190882ee14fb913b3c4362e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
                RENAME CONSTRAINT "UQ_62cab2ee4971b17f70ea9dbd131" TO "REL_f30c613cf5704e9187eba1b885"
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
                RENAME CONSTRAINT "UQ_94d4c1b5db2053044218ad4a9fe" TO "REL_a40d7c9e1ec1c6afefb3621962"
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
                RENAME CONSTRAINT "UQ_72eb14bf70cdc097f1313d90e8d" TO "REL_0f89335855cfc3048e61b046e4"
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
                RENAME CONSTRAINT "UQ_ecf191710cf292775321de71ac8" TO "REL_5159b1227d265354070287f1b1"
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
                RENAME CONSTRAINT "UQ_9ae112d58b0710de731f1fa4066" TO "REL_bd287d06a46934c6500f5dda01"
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
                RENAME CONSTRAINT "UQ_86376ebc728071f56de65cf072c" TO "REL_32533ecf511d436354bb65421e"
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
                RENAME CONSTRAINT "UQ_c3369adae33ef8d50367907fb67" TO "REL_58b55c6d3132cec109e36b6d14"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
                RENAME CONSTRAINT "UQ_4760b53a6a820b09380ec6d9ad7" TO "REL_79bf08349d58880a977c2fc570"
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
                RENAME CONSTRAINT "UQ_6986ec7fcffbe01bc1160e7bcc9" TO "REL_6a27ff5d3f976ee8727f8ee3f4"
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
                RENAME CONSTRAINT "UQ_4f6b735bbf5acf5de6f0621e666" TO "REL_153d1af19d33b8a8f75aabec7b"
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
                RENAME COLUMN "registered_by" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8d190882ee14fb913b3c4362e82" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20" FOREIGN KEY ("emergency_contact_information_id") REFERENCES "emergency_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
            ADD CONSTRAINT "FK_f30c613cf5704e9187eba1b8858" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "school_contact_information"
            ADD CONSTRAINT "FK_a40d7c9e1ec1c6afefb3621962f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "referral_information"
            ADD CONSTRAINT "FK_0f89335855cfc3048e61b046e4f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
            ADD CONSTRAINT "FK_5159b1227d265354070287f1b17" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "more_about_information"
            ADD CONSTRAINT "FK_bd287d06a46934c6500f5dda018" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "medical_information"
            ADD CONSTRAINT "FK_32533ecf511d436354bb65421e3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "intake_information"
            ADD CONSTRAINT "FK_58b55c6d3132cec109e36b6d14d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "client_information"
            ADD CONSTRAINT "FK_79bf08349d58880a977c2fc5700" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "father_contact_information"
            ADD CONSTRAINT "FK_6a27ff5d3f976ee8727f8ee3f4e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admission_information"
            ADD CONSTRAINT "FK_153d1af19d33b8a8f75aabec7b2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "waiver_services"
            ADD CONSTRAINT "FK_bfca19dd247089f0626b5586a0c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
