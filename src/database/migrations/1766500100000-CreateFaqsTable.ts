import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFaqsTable1766500100000 implements MigrationInterface {
  name = 'CreateFaqsTable1766500100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'faqs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'question',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'answer',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Index for ordering and filtering
    await queryRunner.createIndex(
      'faqs',
      new TableIndex({
        name: 'IDX_faqs_order_index',
        columnNames: ['order_index'],
      }),
    );

    await queryRunner.createIndex(
      'faqs',
      new TableIndex({
        name: 'IDX_faqs_is_active',
        columnNames: ['is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('faqs', 'IDX_faqs_is_active');
    await queryRunner.dropIndex('faqs', 'IDX_faqs_order_index');
    await queryRunner.dropTable('faqs');
  }
}
