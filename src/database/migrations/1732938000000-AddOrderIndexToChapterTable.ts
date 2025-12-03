import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderIndexToChapterTable1732938000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add order_index column to chapters table
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD COLUMN "order_index" INT DEFAULT 0
    `);

    // Set order_index based on created_at for existing chapters
    await queryRunner.query(`
      WITH ranked_chapters AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY created_at ASC) - 1 AS new_order_index
        FROM chapters
      )
      UPDATE chapters
      SET order_index = ranked_chapters.new_order_index
      FROM ranked_chapters
      WHERE chapters.id = ranked_chapters.id
    `);

    // Make order_index NOT NULL after setting values
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ALTER COLUMN "order_index" SET NOT NULL
    `);

    // Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX "idx_chapter_order_index" ON "chapters"("course_id", "order_index")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chapter_order_index"`);
    await queryRunner.query(`ALTER TABLE "chapters" DROP COLUMN "order_index"`);
  }
}
