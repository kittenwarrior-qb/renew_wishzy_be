import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSizeToDocuments1734528000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add size column to documents table
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'size',
        type: 'bigint',
        isNullable: true,
        comment: 'File size in bytes',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove size column from documents table
    await queryRunner.dropColumn('documents', 'size');
  }
}
