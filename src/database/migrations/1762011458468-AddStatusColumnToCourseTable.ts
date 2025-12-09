import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnToCourseTable1762011458468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before adding
    const columnExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name = 'status'
    `);

    if (columnExists.length === 0) {
      await queryRunner.query(`ALTER TABLE courses ADD COLUMN status BOOLEAN DEFAULT false`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE courses DROP COLUMN IF EXISTS status`);
  }
}
