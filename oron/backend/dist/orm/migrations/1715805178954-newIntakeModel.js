"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newIntakeModel1715805178954 = void 0;
class newIntakeModel1715805178954 {
    constructor() {
        this.name = 'newIntakeModel1715805178954';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."client_information_citizenship_status_enum" AS ENUM(
                'A citizen of the United States',
                'A noncitizen national of the United States',
                'A lawful permanent resident',
                'A non-citizen authorized to work'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."client_information_race_or_ethinicity_enum" AS ENUM(
                'American Indian or Alaska Native',
                'Asian',
                'Black or African American',
                'Hawaiian or Pacific Islander',
                'White or Caucasian'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "client_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "date_of_birth" TIMESTAMP,
                "state" character varying,
                "citizenship_status" "public"."client_information_citizenship_status_enum" NOT NULL,
                "sex" character varying,
                "race_or_ethinicity" "public"."client_information_race_or_ethinicity_enum",
                "country" character varying,
                "social_security_number" character varying(9),
                "medicaid_number" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_e8f57eac64e41f2385e491f6342" UNIQUE ("social_security_number"),
                CONSTRAINT "UQ_78bba6cc63e13e0f901da71e341" UNIQUE ("medicaid_number"),
                CONSTRAINT "REL_79bf08349d58880a977c2fc570" UNIQUE ("user_id"),
                CONSTRAINT "PK_d75cee92fa7fb50ec41e32a2b16" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "father_contact_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "last_name" character varying,
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
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_6a27ff5d3f976ee8727f8ee3f4" UNIQUE ("user_id"),
                CONSTRAINT "PK_f7580846dfb5d20ac0ddbcb2088" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "waiver_services" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "select_waiver_system" character varying,
                "service_end_date" TIMESTAMP,
                "service_start_date" TIMESTAMP,
                "amount_per_day_week_month" character varying,
                "amount_per_year" character varying,
                "admission_information_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_0df7d1e60765257dabe4847b9f1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "admission_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "poc_authorization_number" character varying,
                "poc_start_date" TIMESTAMP,
                "poc_end_date" TIMESTAMP,
                "waiver_services" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_153d1af19d33b8a8f75aabec7b" UNIQUE ("user_id"),
                CONSTRAINT "PK_dae089c25d63a96d5a52daef1cd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "mother_contact_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "last_name" character varying,
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
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_5159b1227d265354070287f1b1" UNIQUE ("user_id"),
                CONSTRAINT "PK_84d0de33606dba1036c03ea1858" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "school_contact_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name_of_school" character varying,
                "school_address" character varying,
                "phone" character varying,
                "school_email" character varying,
                "contact_person" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a40d7c9e1ec1c6afefb3621962" UNIQUE ("user_id"),
                CONSTRAINT "PK_10cd614efa303613a57914e67a4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "service_coordinator_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" character varying,
                "email" character varying,
                "phone" character varying,
                "country" character varying,
                "fax_number" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_f30c613cf5704e9187eba1b885" UNIQUE ("user_id"),
                CONSTRAINT "PK_a7466b52b47fe95008c724ae5d5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_familiar_communication_modes_enum" AS ENUM('Verbal', 'Non_Verbal', 'Sign_Language', 'PECS')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_toileting_enum" AS ENUM(
                'Toilet_Trained',
                'Not_Toilet_Trained',
                'Toilet_Trained_But_Requires_Supervision'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_cared_for_by_enum" AS ENUM('female', 'male')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."more_about_information_document_provided_during_intake_enum" AS ENUM(
                'IEP',
                'Behavior_Plan',
                'Psychological_Evaluation'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "more_about_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "things_i_can_do_by_myself" character varying,
                "things_i_need_help_with" character varying,
                "new_skills_i_want_to_learn" character varying,
                "my_hobbies" character varying,
                "favorite_food_and_snacks" character varying,
                "what_makes_me_mad" character varying,
                "behaviors_i_sometimes_display" character varying,
                "ways_my_behaviors_can_be_managed" character varying,
                "my_house_rules" character varying,
                "familiar_communication_modes" "public"."more_about_information_familiar_communication_modes_enum",
                "can_be_transported_alone" boolean,
                "toileting" "public"."more_about_information_toileting_enum",
                "cared_for_by" "public"."more_about_information_cared_for_by_enum",
                "document_provided_during_intake" "public"."more_about_information_document_provided_during_intake_enum",
                "good_performance_reward" character varying,
                "other_comments" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_bd287d06a46934c6500f5dda01" UNIQUE ("user_id"),
                CONSTRAINT "PK_96250872b8ffc5e51fb46be4fb4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "medical_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "diagnosis" character varying,
                "medical_history_or_allergies" character varying,
                "medications" character varying,
                "other_comments" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_32533ecf511d436354bb65421e" UNIQUE ("user_id"),
                CONSTRAINT "PK_c632f283e363bd592922edd31c0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "referral_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "date_of_referral" TIMESTAMP,
                "referral_source_name" character varying,
                "referral_type" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_0f89335855cfc3048e61b046e4" UNIQUE ("user_id"),
                CONSTRAINT "PK_98617e458567af660325c4ef44b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "people_present_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "relationship_to_participant" character varying,
                "intake_information_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_44cbd9dcaeafdc7236da049977a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "intake_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "who_conducted_intake" character varying,
                "date_of_intake" TIMESTAMP,
                "people_present" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_58b55c6d3132cec109e36b6d14" UNIQUE ("user_id"),
                CONSTRAINT "PK_3443b92920c2c9e2fe2292b38a8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."intake_full_form_status_enum" AS ENUM(
                'active',
                'inactive',
                'disengage',
                'not_admitted',
                'new_intake'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "intake_full_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."intake_full_form_status_enum" DEFAULT 'new_intake',
                "admission_information_id" uuid,
                "client_information_id" uuid,
                "father_contact_information_id" uuid,
                "mother_contact_information_id" uuid,
                "school_contact_information_id" uuid,
                "service_coordinator_information_id" uuid,
                "more_about_information_id" uuid,
                "medical_information_id" uuid,
                "referral_information_id" uuid,
                "intake_information_id" uuid,
                "emergency_contact_information_id" uuid,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_d91dac48874d69d8cfe10136eb" UNIQUE ("admission_information_id"),
                CONSTRAINT "REL_b3502622fe7b78beb9ea3123f5" UNIQUE ("client_information_id"),
                CONSTRAINT "REL_79a8fd8a93feeaac1c8da15291" UNIQUE ("father_contact_information_id"),
                CONSTRAINT "REL_aa34ed85cd9c933ba1169bcfe1" UNIQUE ("mother_contact_information_id"),
                CONSTRAINT "REL_c35d1d4e6d3484e2274b87ead6" UNIQUE ("school_contact_information_id"),
                CONSTRAINT "REL_0a0f4d30f001e89d8cabcd85b7" UNIQUE ("service_coordinator_information_id"),
                CONSTRAINT "REL_ba68d2759f57f26dc78e202ba5" UNIQUE ("more_about_information_id"),
                CONSTRAINT "REL_8c9a488e236b51322dae0cbb06" UNIQUE ("medical_information_id"),
                CONSTRAINT "REL_613247400fd011642b45873465" UNIQUE ("referral_information_id"),
                CONSTRAINT "REL_1c902b161554579f5e0ae5bea6" UNIQUE ("intake_information_id"),
                CONSTRAINT "REL_8742b7763bbba3fc9fae71dad2" UNIQUE ("emergency_contact_information_id"),
                CONSTRAINT "REL_8d190882ee14fb913b3c4362e8" UNIQUE ("user_id"),
                CONSTRAINT "PK_1f0e1b1d83af76a7081908ca650" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "REL_d7d0e1e279b09a9b338b3e5ce2"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d" UNIQUE ("employee_personal_information_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "email" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_number_and_house_address" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "country" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "apartment_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "home_phone_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "work_phone_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "social_security_number" character varying(9)
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD CONSTRAINT "UQ_bef0c9cca030003ea90fd3828e8" UNIQUE ("social_security_number")
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress'
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD "social_security_number" character varying(9)
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD CONSTRAINT "UQ_552acaf8a704d087ec73b5eabce" UNIQUE ("social_security_number")
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information"
            ADD "social_security_number" character varying(9)
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information"
            ADD CONSTRAINT "UQ_0c350d847ee2956d12340747b04" UNIQUE ("social_security_number")
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "waiver_services"
            ADD CONSTRAINT "FK_13abbf4548c076ff331b27bd403" FOREIGN KEY ("admission_information_id") REFERENCES "admission_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "admission_information"
            ADD CONSTRAINT "FK_153d1af19d33b8a8f75aabec7b2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mother_contact_information"
            ADD CONSTRAINT "FK_5159b1227d265354070287f1b17" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "school_contact_information"
            ADD CONSTRAINT "FK_a40d7c9e1ec1c6afefb3621962f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "service_coordinator_information"
            ADD CONSTRAINT "FK_f30c613cf5704e9187eba1b8858" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "referral_information"
            ADD CONSTRAINT "FK_0f89335855cfc3048e61b046e4f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "people_present_information"
            ADD CONSTRAINT "FK_106d59e355316a31c0b316b2b3a" FOREIGN KEY ("intake_information_id") REFERENCES "intake_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_information"
            ADD CONSTRAINT "FK_58b55c6d3132cec109e36b6d14d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_d91dac48874d69d8cfe10136ebc" FOREIGN KEY ("admission_information_id") REFERENCES "admission_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_b3502622fe7b78beb9ea3123f50" FOREIGN KEY ("client_information_id") REFERENCES "client_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_79a8fd8a93feeaac1c8da152912" FOREIGN KEY ("father_contact_information_id") REFERENCES "father_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_aa34ed85cd9c933ba1169bcfe1c" FOREIGN KEY ("mother_contact_information_id") REFERENCES "mother_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_c35d1d4e6d3484e2274b87ead6e" FOREIGN KEY ("school_contact_information_id") REFERENCES "school_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_0a0f4d30f001e89d8cabcd85b76" FOREIGN KEY ("service_coordinator_information_id") REFERENCES "service_coordinator_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_ba68d2759f57f26dc78e202ba55" FOREIGN KEY ("more_about_information_id") REFERENCES "more_about_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8c9a488e236b51322dae0cbb060" FOREIGN KEY ("medical_information_id") REFERENCES "medical_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_613247400fd011642b458734656" FOREIGN KEY ("referral_information_id") REFERENCES "referral_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_1c902b161554579f5e0ae5bea6e" FOREIGN KEY ("intake_information_id") REFERENCES "intake_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20" FOREIGN KEY ("emergency_contact_information_id") REFERENCES "emergency_contact_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form"
            ADD CONSTRAINT "FK_8d190882ee14fb913b3c4362e82" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8d190882ee14fb913b3c4362e82"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8742b7763bbba3fc9fae71dad20"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_1c902b161554579f5e0ae5bea6e"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_613247400fd011642b458734656"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_8c9a488e236b51322dae0cbb060"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_ba68d2759f57f26dc78e202ba55"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_0a0f4d30f001e89d8cabcd85b76"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_c35d1d4e6d3484e2274b87ead6e"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_aa34ed85cd9c933ba1169bcfe1c"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_79a8fd8a93feeaac1c8da152912"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_b3502622fe7b78beb9ea3123f50"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_full_form" DROP CONSTRAINT "FK_d91dac48874d69d8cfe10136ebc"
        `);
        await queryRunner.query(`
            ALTER TABLE "intake_information" DROP CONSTRAINT "FK_58b55c6d3132cec109e36b6d14d"
        `);
        await queryRunner.query(`
            ALTER TABLE "people_present_information" DROP CONSTRAINT "FK_106d59e355316a31c0b316b2b3a"
        `);
        await queryRunner.query(`
            ALTER TABLE "referral_information" DROP CONSTRAINT "FK_0f89335855cfc3048e61b046e4f"
        `);
        await queryRunner.query(`
            ALTER TABLE "medical_information" DROP CONSTRAINT "FK_32533ecf511d436354bb65421e3"
        `);
        await queryRunner.query(`
            ALTER TABLE "more_about_information" DROP CONSTRAINT "FK_bd287d06a46934c6500f5dda018"
        `);
        await queryRunner.query(`
            ALTER TABLE "service_coordinator_information" DROP CONSTRAINT "FK_f30c613cf5704e9187eba1b8858"
        `);
        await queryRunner.query(`
            ALTER TABLE "school_contact_information" DROP CONSTRAINT "FK_a40d7c9e1ec1c6afefb3621962f"
        `);
        await queryRunner.query(`
            ALTER TABLE "mother_contact_information" DROP CONSTRAINT "FK_5159b1227d265354070287f1b17"
        `);
        await queryRunner.query(`
            ALTER TABLE "admission_information" DROP CONSTRAINT "FK_153d1af19d33b8a8f75aabec7b2"
        `);
        await queryRunner.query(`
            ALTER TABLE "waiver_services" DROP CONSTRAINT "FK_13abbf4548c076ff331b27bd403"
        `);
        await queryRunner.query(`
            ALTER TABLE "father_contact_information" DROP CONSTRAINT "FK_6a27ff5d3f976ee8727f8ee3f4e"
        `);
        await queryRunner.query(`
            ALTER TABLE "client_information" DROP CONSTRAINT "FK_79bf08349d58880a977c2fc5700"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information" DROP CONSTRAINT "UQ_0c350d847ee2956d12340747b04"
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "personal_information"
            ADD "social_security_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP CONSTRAINT "UQ_552acaf8a704d087ec73b5eabce"
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD "social_security_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'in_progress' - bio - data_status_enum "
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP CONSTRAINT "UQ_bef0c9cca030003ea90fd3828e8"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data" DROP COLUMN "social_security_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ADD "social_security_number" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "work_phone_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "home_phone_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "apartment_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "country"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_number_and_house_address"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "email"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "UQ_d7d0e1e279b09a9b338b3e5ce2d"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "employee_personal_information_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "street_address"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP COLUMN "relationship_to_employee"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "street_address" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "relationship_to_employee" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD "employee_personal_information_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "REL_d7d0e1e279b09a9b338b3e5ce2" UNIQUE ("employee_personal_information_id")
        `);
        await queryRunner.query(`
            DROP TABLE "intake_full_form"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."intake_full_form_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "intake_information"
        `);
        await queryRunner.query(`
            DROP TABLE "people_present_information"
        `);
        await queryRunner.query(`
            DROP TABLE "referral_information"
        `);
        await queryRunner.query(`
            DROP TABLE "medical_information"
        `);
        await queryRunner.query(`
            DROP TABLE "more_about_information"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_document_provided_during_intake_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_cared_for_by_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_toileting_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."more_about_information_familiar_communication_modes_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "service_coordinator_information"
        `);
        await queryRunner.query(`
            DROP TABLE "school_contact_information"
        `);
        await queryRunner.query(`
            DROP TABLE "mother_contact_information"
        `);
        await queryRunner.query(`
            DROP TABLE "admission_information"
        `);
        await queryRunner.query(`
            DROP TABLE "waiver_services"
        `);
        await queryRunner.query(`
            DROP TABLE "father_contact_information"
        `);
        await queryRunner.query(`
            DROP TABLE "client_information"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."client_information_race_or_ethinicity_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."client_information_citizenship_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
exports.newIntakeModel1715805178954 = newIntakeModel1715805178954;
//# sourceMappingURL=1715805178954-newIntakeModel.js.map