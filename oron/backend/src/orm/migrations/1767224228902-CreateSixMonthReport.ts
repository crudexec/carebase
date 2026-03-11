import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSixMonthReport1767224228902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the six_month_reports table
    await queryRunner.createTable(
      new Table({
        name: 'six_month_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'report_type',
            type: 'enum',
            enum: ['IISS_Assessment', 'FC_Assessment', 'ITI_Assessment', 'ALP_Assessment', 'Respite'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'generating', 'completed', 'failed'],
            default: "'draft'",
          },
          {
            name: 'period',
            type: 'enum',
            enum: ['first_six_months', 'second_six_months', 'custom'],
            default: "'custom'",
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'treatment_plan_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'intake_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'generated_by_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'executive_summary',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'behavioral_management',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'significant_life_events',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'skills_progress',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'session_highlights_summary',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'concerns_and_challenges_summary',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'visit_attendance',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'goals_assessment',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'recommendations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'next_period_goals',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'additional_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'supervisor_comments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_final',
            type: 'boolean',
            default: false,
          },
          {
            name: 'finalized_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'finalized_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'pdf_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'pdf_generated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'six_month_reports',
      new TableForeignKey({
        columnNames: ['treatment_plan_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'treatment_full_plan',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'six_month_reports',
      new TableForeignKey({
        columnNames: ['intake_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'intake_full_form',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'six_month_reports',
      new TableForeignKey({
        columnNames: ['generated_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'six_month_reports',
      new TableForeignKey({
        columnNames: ['finalized_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('six_month_reports');
    const foreignKeys = table.foreignKeys;
    
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('six_month_reports', foreignKey);
    }

    // Drop the table
    await queryRunner.dropTable('six_month_reports');
  }
}