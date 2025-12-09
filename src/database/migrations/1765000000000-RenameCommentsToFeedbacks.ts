import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCommentsToFeedbacks1765000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if feedbacks table already exists
    const feedbacksExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feedbacks'
      );
    `);

    const commentsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comments'
      );
    `);

    if (feedbacksExists[0].exists) {
      // Feedbacks table already exists (likely created by TypeORM sync)
      // Just drop comments table if it exists
      if (commentsExists[0].exists) {
        // Migrate data from comments to feedbacks if both exist
        await queryRunner.query(`
          INSERT INTO "feedbacks" (id, content, rating, "like", dislike, user_id, course_id, created_at, updated_at)
          SELECT id, content, rating, "like", dislike, user_id, course_id, created_at, updated_at
          FROM "comments"
          ON CONFLICT (id) DO NOTHING
        `);
        await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
      }
    } else if (commentsExists[0].exists) {
      // Only comments exists, rename it to feedbacks
      await queryRunner.query(`ALTER TABLE "comments" RENAME TO "feedbacks"`);
      
      // Try to rename constraints (may not exist with exact names)
      try {
        await queryRunner.query(`
          ALTER TABLE "feedbacks" 
          RENAME CONSTRAINT "fk_comments_user" TO "fk_feedbacks_user"
        `);
      } catch (e) { /* Constraint may not exist */ }
      
      try {
        await queryRunner.query(`
          ALTER TABLE "feedbacks" 
          RENAME CONSTRAINT "fk_comments_course" TO "fk_feedbacks_course"
        `);
      } catch (e) { /* Constraint may not exist */ }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if tables exist before operations
    const feedbacksExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feedbacks'
      );
    `);

    if (feedbacksExists[0].exists) {
      await queryRunner.query(`ALTER TABLE "feedbacks" RENAME TO "comments"`);
      
      try {
        await queryRunner.query(`
          ALTER TABLE "comments" 
          RENAME CONSTRAINT "fk_feedbacks_user" TO "fk_comments_user"
        `);
      } catch (e) { /* Constraint may not exist */ }
      
      try {
        await queryRunner.query(`
          ALTER TABLE "comments" 
          RENAME CONSTRAINT "fk_feedbacks_course" TO "fk_comments_course"
        `);
      } catch (e) { /* Constraint may not exist */ }
    }
  }
}

