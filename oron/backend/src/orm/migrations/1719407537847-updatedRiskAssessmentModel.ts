import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedRiskAssessmentModel1719407537847 implements MigrationInterface {
  name = 'updatedRiskAssessmentModel1719407537847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "spent_time_with_tb_patient_in_the_last_two_years" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "were_you_born_in_a_country_where_tb_is_common" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "country_of_birth" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "traveled_to_a_country_where_tb_is_common" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "country_of_travel" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "members_of_family_traveled_to_us_from_another_country" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form"
            ADD "family_country_of_travel" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user-bio-data"
            ALTER COLUMN "status"
            SET DEFAULT 'not_started' - bio - data_status_enum "
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "family_country_of_travel"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "members_of_family_traveled_to_us_from_another_country"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "country_of_travel"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "traveled_to_a_country_where_tb_is_common"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "country_of_birth"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "were_you_born_in_a_country_where_tb_is_common"
        `);
    await queryRunner.query(`
            ALTER TABLE "tuberculosis_mantoux_form" DROP COLUMN "spent_time_with_tb_patient_in_the_last_two_years"
        `);
  }
}
