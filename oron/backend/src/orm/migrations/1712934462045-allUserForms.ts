import { MigrationInterface, QueryRunner } from 'typeorm';

export class allUserForms1712934462045 implements MigrationInterface {
  name = 'allUserForms1712934462045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "employee_personal_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "date_of_birth" TIMESTAMP,
                "phone" character varying,
                "home_phone_number" character varying,
                "street_address" character varying,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "gender" character varying,
                "race_or_ethinicity" character varying,
                "social_security_number" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_134f295841810d25b2ceb8aba5" UNIQUE ("user_id"),
                CONSTRAINT "PK_cba000da0a2a52e881d1b17ea63" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "flu_attestation_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "have_received_flu_vaccine" boolean,
                "date_received_flu_vaccine" TIMESTAMP,
                "vaccination_site" character varying,
                "received_flu_vaccine_elsewhere" boolean,
                "medical_contraindication_to_receiving_vaccine" boolean,
                "personal_or_religious_beliefs_preventing_vaccination" boolean,
                "allergic_to_vaccine_components" boolean,
                "concerns_about_vaccine_safety" boolean,
                "other" text,
                "declined_flu_vaccine" boolean,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_03601f93362dd7c4a346e6aaa7" UNIQUE ("user_id"),
                CONSTRAINT "PK_4a0a584198f20d13cb3786e1bf7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mmr_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "flu_form_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_c26b551a9834d16ee5c7cd6cf9" UNIQUE ("signed_by"),
                CONSTRAINT "REL_d601c59d870a161d2232e05a55" UNIQUE ("flu_form_id"),
                CONSTRAINT "PK_71ca074d01872282f459b6b7d94" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "emergency_contact_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "relationship_to_employee" character varying,
                "street_address" character varying,
                "phone" character varying,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "user_id" uuid NOT NULL,
                "employee_personal_information_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_70944f3b1f9011b7cc700da10d" UNIQUE ("user_id"),
                CONSTRAINT "REL_d7d0e1e279b09a9b338b3e5ce2" UNIQUE ("employee_personal_information_id"),
                CONSTRAINT "PK_25a962a898e3ab6de5a09d1b0db" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "flu_employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "job_title" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_2f049f78f29030c155dd9278ae" UNIQUE ("user_id"),
                CONSTRAINT "PK_9f4e59f11a16c7539763aa897c5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "personal_information_hepatitis_b_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "job_title" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_e01f35f2b1b538ba4e9b6cec0b" UNIQUE ("user_id"),
                CONSTRAINT "PK_4871072d0de015d5dce167d828c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "hepatitis_b_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_1ee6614eed8381e6117844d827" UNIQUE ("signed_by"),
                CONSTRAINT "PK_77c3f416d3b789158ca737f8869" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "hepatitis_b_attestation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "had_hepatitis_b_vaccine_series_of_three" boolean,
                "arranged_for_hepatitis_b_vaccine_series_of_three" boolean,
                "declined_hepatitis_b_vaccine_series_of_three" boolean,
                "signed_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_d00e8741d214d665ee67c548d8" UNIQUE ("signed_by"),
                CONSTRAINT "PK_c36677ba4de9d9cd48cb5a0921c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "influenza_vaccination_declination" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "aware_influenza_serious_disease" boolean,
                "aware_vaccine_available_to_protect" boolean,
                "can_shed_virus_after_contracting" boolean,
                "can_spread_influenza_without_symptoms" boolean,
                "my_influenza_vaccine_immunity_changes_every_year" boolean,
                "can_not_get_influenza_from_vaccine" boolean,
                "consequences_of_vaccination_refusal" boolean,
                "reason_for_declining_vaccine" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_d1015288ecbda8faddbd15b0c4" UNIQUE ("user_id"),
                CONSTRAINT "PK_5e7593053785a73ab372c177794" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "influenza_employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "department" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_88e04442e8e8560e854f59d4a2" UNIQUE ("user_id"),
                CONSTRAINT "PK_9e94c2aaa92cf5716ce87ef4dfc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mmr_attestation_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "do_not_think_will_contract_mumps" boolean,
                "do_not_think_serious_disease" boolean,
                "side_effects_from_vaccine" boolean,
                "will_stay_home_if_infected" boolean,
                "other" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a0d143de7edd9a9f8373282362" UNIQUE ("user_id"),
                CONSTRAINT "PK_d9f4e465c70d5792c99f3446441" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "influenza_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "influenza_form_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_33e81871b9b586a5935aa3e49f" UNIQUE ("signed_by"),
                CONSTRAINT "REL_287e60154089c56ca6526c3476" UNIQUE ("influenza_form_id"),
                CONSTRAINT "PK_9da32933499dfdbade1c432a18a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mmr_employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "job_title" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_4e5a3f743acb9033baf299b2a2" UNIQUE ("user_id"),
                CONSTRAINT "PK_667d6f6eb3294966bf64136a534" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "n95_fit_attestation_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status_received_n95_fit_testing" boolean DEFAULT false,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_c49a97a76108a1ee609871368b" UNIQUE ("user_id"),
                CONSTRAINT "PK_80f05c0271d4bc550dc2f2077eb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "n95_fit_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "full_name" character varying,
                "date_of_filling_form" TIMESTAMP,
                "signed_by" uuid NOT NULL,
                "n95_form_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_e56a39d89383346fcde8dce57c" UNIQUE ("signed_by"),
                CONSTRAINT "REL_be8dba2f0b95b7d5d0d9fb47cc" UNIQUE ("n95_form_id"),
                CONSTRAINT "PK_87bac42cfe29b524910e57e6694" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "job_title" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_67b6887d005a1e77fab2775a57" UNIQUE ("user_id"),
                CONSTRAINT "PK_d105d2dd8699c55e00a0df5ab7b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "pneumococcal_vaccination_information_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "had_pneumococcal_vaccination" boolean DEFAULT false,
                "declined_pneumococcal_vaccination" boolean DEFAULT false,
                "received_pneumococcal_vaccination" boolean,
                "medical_contraindication" boolean,
                "religious_beliefs" boolean,
                "other" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_9399c9de31e4a6b48735072da4" UNIQUE ("user_id"),
                CONSTRAINT "PK_566d03f82ee0ae636e77eefea6d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "pneumococcal_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "pneumococcal_form_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_27a2457ad578a3779df7bf556d" UNIQUE ("signed_by"),
                CONSTRAINT "REL_3076c72dfd85e60b78677470f8" UNIQUE ("pneumococcal_form_id"),
                CONSTRAINT "PK_c40fe8ad1d812bb4fa40c72ac70" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tuberculosis_mantoux_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "had_tb_infection" boolean DEFAULT false,
                "had_positive_tb_skin_test" boolean DEFAULT false,
                "had_tb_infection_date" TIMESTAMP,
                "had_positive_tb_skin_test_date" TIMESTAMP,
                "have_you_been_immunized_with_bcg_vaccine" boolean DEFAULT false,
                "immunization_descripton" text,
                "vaccine_past_two_weeks" boolean DEFAULT false,
                "steriod_injection_past_two_weeks" boolean DEFAULT false,
                "exposure_to_tb_past_two_weeks" boolean DEFAULT false,
                "coughing_blood" boolean DEFAULT false,
                "profuse_night_sweats" boolean DEFAULT false,
                "loss_of_appetite" boolean DEFAULT false,
                "unexplained_weight_loss" boolean DEFAULT false,
                "chill_or_fever" boolean DEFAULT false,
                "persistent_cough_last_two_weeks" boolean DEFAULT false,
                "chest_pain" boolean DEFAULT false,
                "last_chest_xray_date" TIMESTAMP,
                "owner" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_a69cf17ffa2d9cd32fef8af4ff" UNIQUE ("owner"),
                CONSTRAINT "PK_7de4a11b6bc9d4f3a21f432470b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "ppd_administration_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "had_tb_infection" boolean DEFAULT false,
                "had_positive_tb_skin_test" boolean DEFAULT false,
                "had_tb_infection_date" TIMESTAMP,
                "had_positive_tb_skin_test_date" TIMESTAMP,
                "have_you_been_immunized_with_bcg_vaccine" boolean DEFAULT false,
                "immunization_descripton" text,
                "vaccine_past_two_weeks" boolean DEFAULT false,
                "steriod_injection_past_two_weeks" boolean DEFAULT false,
                "steriods_past_four_weeks" boolean DEFAULT false,
                "exposure_to_tb_after_last_tb_test" boolean DEFAULT false,
                "user_id" uuid NOT NULL,
                "tuberculosis_mantoux_form_id" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "tuberculosisMantouxForm_id" uuid,
                CONSTRAINT "REL_245d75418fb4c8fc1e22be93ba" UNIQUE ("user_id"),
                CONSTRAINT "REL_5fe4dbb6022fe5168b5f0cc47f" UNIQUE ("tuberculosisMantouxForm_id"),
                CONSTRAINT "PK_32c92123f63c526ea92cab8c673" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tb_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "tb_form_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_ebcae3dfd673e4c1425a3e1efc" UNIQUE ("signed_by"),
                CONSTRAINT "REL_6a9745d67f8f5874b4b5b4430a" UNIQUE ("tb_form_id"),
                CONSTRAINT "PK_66cca543556341b671014618fc5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "varicella_employee_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "job_title" character varying,
                "date_of_filling_form" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_c99956f6882151051f370cff2c" UNIQUE ("user_id"),
                CONSTRAINT "PK_5d80df302a41ee87acfa994f8ee" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "varicella_attestation_form" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "had_chicken_pox" boolean,
                "will_not_contract_chicken_pox" boolean,
                "chicken_pox_not_serious_disease" boolean,
                "side_effects_from_chicken_pox_vaccine" boolean,
                "will_stay_home_if_infected" boolean,
                "other" text,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_4c3cdb02b93383961afc0163be" UNIQUE ("user_id"),
                CONSTRAINT "PK_d3040e9ee2be300c9c0f9741f30" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "varicella_signature" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "signature_data" character varying NOT NULL,
                "signed_by" uuid NOT NULL,
                "varicella_form_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_fa4b963637d57bd5eef7d7f8bc" UNIQUE ("signed_by"),
                CONSTRAINT "REL_79c894b15c959d0bc35bf53ede" UNIQUE ("varicella_form_id"),
                CONSTRAINT "PK_0d0bea1f4b82760aadbd4787bb9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "REL_d601c59d870a161d2232e05a55"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_d601c59d870a161d2232e05a550" UNIQUE ("flu_form_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "mmr_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8" UNIQUE ("mmr_form_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information"
            ADD CONSTRAINT "FK_134f295841810d25b2ceb8aba54" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_attestation_form"
            ADD CONSTRAINT "FK_03601f93362dd7c4a346e6aaa74" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_c26b551a9834d16ee5c7cd6cf97" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_d601c59d870a161d2232e05a550" FOREIGN KEY ("flu_form_id") REFERENCES "flu_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_70944f3b1f9011b7cc700da10dd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information"
            ADD CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d" FOREIGN KEY ("employee_personal_information_id") REFERENCES "employee_personal_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_employee_information"
            ADD CONSTRAINT "FK_2f049f78f29030c155dd9278ae6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_information_hepatitis_b_form"
            ADD CONSTRAINT "FK_e01f35f2b1b538ba4e9b6cec0ba" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_signature"
            ADD CONSTRAINT "FK_1ee6614eed8381e6117844d827e" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation"
            ADD CONSTRAINT "FK_d00e8741d214d665ee67c548d88" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination"
            ADD CONSTRAINT "FK_d1015288ecbda8faddbd15b0c40" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_employee_information"
            ADD CONSTRAINT "FK_88e04442e8e8560e854f59d4a22" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_attestation_form"
            ADD CONSTRAINT "FK_a0d143de7edd9a9f8373282362a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ADD CONSTRAINT "FK_33e81871b9b586a5935aa3e49fa" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_signature"
            ADD CONSTRAINT "FK_287e60154089c56ca6526c3476d" FOREIGN KEY ("influenza_form_id") REFERENCES "influenza_vaccination_declination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8" FOREIGN KEY ("mmr_form_id") REFERENCES "mmr_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_employee_information"
            ADD CONSTRAINT "FK_4e5a3f743acb9033baf299b2a2a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_attestation_form"
            ADD CONSTRAINT "FK_c49a97a76108a1ee609871368b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_signature"
            ADD CONSTRAINT "FK_e56a39d89383346fcde8dce57cf" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_signature"
            ADD CONSTRAINT "FK_be8dba2f0b95b7d5d0d9fb47cc5" FOREIGN KEY ("n95_form_id") REFERENCES "n95_fit_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_information"
            ADD CONSTRAINT "FK_67b6887d005a1e77fab2775a579" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_vaccination_information_form"
            ADD CONSTRAINT "FK_9399c9de31e4a6b48735072da41" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_signature"
            ADD CONSTRAINT "FK_27a2457ad578a3779df7bf556db" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_signature"
            ADD CONSTRAINT "FK_3076c72dfd85e60b78677470f88" FOREIGN KEY ("pneumococcal_form_id") REFERENCES "pneumococcal_vaccination_information_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD CONSTRAINT "FK_a69cf17ffa2d9cd32fef8af4ff6" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ppd_administration_form"
            ADD CONSTRAINT "FK_245d75418fb4c8fc1e22be93baf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ppd_administration_form"
            ADD CONSTRAINT "FK_5fe4dbb6022fe5168b5f0cc47f8" FOREIGN KEY ("tuberculosisMantouxForm_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ADD CONSTRAINT "FK_ebcae3dfd673e4c1425a3e1efc1" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature"
            ADD CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae" FOREIGN KEY ("tb_form_id") REFERENCES "tuberculosis_mantoux_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_employee_information"
            ADD CONSTRAINT "FK_c99956f6882151051f370cff2ca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_attestation_form"
            ADD CONSTRAINT "FK_4c3cdb02b93383961afc0163be8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_fa4b963637d57bd5eef7d7f8bc9" FOREIGN KEY ("signed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature"
            ADD CONSTRAINT "FK_79c894b15c959d0bc35bf53eded" FOREIGN KEY ("varicella_form_id") REFERENCES "varicella_attestation_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_79c894b15c959d0bc35bf53eded"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_signature" DROP CONSTRAINT "FK_fa4b963637d57bd5eef7d7f8bc9"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_attestation_form" DROP CONSTRAINT "FK_4c3cdb02b93383961afc0163be8"
        `);
    await queryRunner.query(`
            ALTER TABLE "varicella_employee_information" DROP CONSTRAINT "FK_c99956f6882151051f370cff2ca"
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_6a9745d67f8f5874b4b5b4430ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "tb_signature" DROP CONSTRAINT "FK_ebcae3dfd673e4c1425a3e1efc1"
        `);
    await queryRunner.query(`
            ALTER TABLE "ppd_administration_form" DROP CONSTRAINT "FK_5fe4dbb6022fe5168b5f0cc47f8"
        `);
    await queryRunner.query(`
            ALTER TABLE "ppd_administration_form" DROP CONSTRAINT "FK_245d75418fb4c8fc1e22be93baf"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP CONSTRAINT "FK_a69cf17ffa2d9cd32fef8af4ff6"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_signature" DROP CONSTRAINT "FK_3076c72dfd85e60b78677470f88"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_signature" DROP CONSTRAINT "FK_27a2457ad578a3779df7bf556db"
        `);
    await queryRunner.query(`
            ALTER TABLE "pneumococcal_vaccination_information_form" DROP CONSTRAINT "FK_9399c9de31e4a6b48735072da41"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_information" DROP CONSTRAINT "FK_67b6887d005a1e77fab2775a579"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_signature" DROP CONSTRAINT "FK_be8dba2f0b95b7d5d0d9fb47cc5"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_signature" DROP CONSTRAINT "FK_e56a39d89383346fcde8dce57cf"
        `);
    await queryRunner.query(`
            ALTER TABLE "n95_fit_attestation_form" DROP CONSTRAINT "FK_c49a97a76108a1ee609871368b1"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_employee_information" DROP CONSTRAINT "FK_4e5a3f743acb9033baf299b2a2a"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_signature" DROP CONSTRAINT "FK_287e60154089c56ca6526c3476d"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_signature" DROP CONSTRAINT "FK_33e81871b9b586a5935aa3e49fa"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_attestation_form" DROP CONSTRAINT "FK_a0d143de7edd9a9f8373282362a"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_employee_information" DROP CONSTRAINT "FK_88e04442e8e8560e854f59d4a22"
        `);
    await queryRunner.query(`
            ALTER TABLE "influenza_vaccination_declination" DROP CONSTRAINT "FK_d1015288ecbda8faddbd15b0c40"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_attestation" DROP CONSTRAINT "FK_d00e8741d214d665ee67c548d88"
        `);
    await queryRunner.query(`
            ALTER TABLE "hepatitis_b_signature" DROP CONSTRAINT "FK_1ee6614eed8381e6117844d827e"
        `);
    await queryRunner.query(`
            ALTER TABLE "personal_information_hepatitis_b_form" DROP CONSTRAINT "FK_e01f35f2b1b538ba4e9b6cec0ba"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_employee_information" DROP CONSTRAINT "FK_2f049f78f29030c155dd9278ae6"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_d7d0e1e279b09a9b338b3e5ce2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "emergency_contact_information" DROP CONSTRAINT "FK_70944f3b1f9011b7cc700da10dd"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "FK_c26b551a9834d16ee5c7cd6cf97"
        `);
    await queryRunner.query(`
            ALTER TABLE "flu_attestation_form" DROP CONSTRAINT "FK_03601f93362dd7c4a346e6aaa74"
        `);
    await queryRunner.query(`
            ALTER TABLE "employee_personal_information" DROP CONSTRAINT "FK_134f295841810d25b2ceb8aba54"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_da4b2dd99281a99f0d6862ce7a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "mmr_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP CONSTRAINT "UQ_d601c59d870a161d2232e05a550"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature" DROP COLUMN "flu_form_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD "flu_form_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "mmr_signature"
            ADD CONSTRAINT "REL_d601c59d870a161d2232e05a55" UNIQUE ("flu_form_id")
        `);
    await queryRunner.query(`
            DROP TABLE "varicella_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "varicella_attestation_form"
        `);
    await queryRunner.query(`
            DROP TABLE "varicella_employee_information"
        `);
    await queryRunner.query(`
            DROP TABLE "tb_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "ppd_administration_form"
        `);
    await queryRunner.query(`
            DROP TABLE "tuberculosis_mantoux_form"
        `);
    await queryRunner.query(`
            DROP TABLE "pneumococcal_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "pneumococcal_vaccination_information_form"
        `);
    await queryRunner.query(`
            DROP TABLE "employee_information"
        `);
    await queryRunner.query(`
            DROP TABLE "n95_fit_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "n95_fit_attestation_form"
        `);
    await queryRunner.query(`
            DROP TABLE "mmr_employee_information"
        `);
    await queryRunner.query(`
            DROP TABLE "influenza_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "mmr_attestation_form"
        `);
    await queryRunner.query(`
            DROP TABLE "influenza_employee_information"
        `);
    await queryRunner.query(`
            DROP TABLE "influenza_vaccination_declination"
        `);
    await queryRunner.query(`
            DROP TABLE "hepatitis_b_attestation"
        `);
    await queryRunner.query(`
            DROP TABLE "hepatitis_b_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "personal_information_hepatitis_b_form"
        `);
    await queryRunner.query(`
            DROP TABLE "flu_employee_information"
        `);
    await queryRunner.query(`
            DROP TABLE "emergency_contact_information"
        `);
    await queryRunner.query(`
            DROP TABLE "mmr_signature"
        `);
    await queryRunner.query(`
            DROP TABLE "flu_attestation_form"
        `);
    await queryRunner.query(`
            DROP TABLE "employee_personal_information"
        `);
  }
}
