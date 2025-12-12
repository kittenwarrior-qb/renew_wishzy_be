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
        // Check if comments table has rating and course_id columns (old schema)
        const hasRatingColumn = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'comments' 
            AND column_name = 'rating'
          );
        `);
        
        const hasCourseIdColumn = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'comments' 
            AND column_name = 'course_id'
          );
        `);

        // Only migrate if comments has the old schema (with rating and course_id)
        if (hasRatingColumn[0].exists && hasCourseIdColumn[0].exists) {
          // Migrate data from comments to feedbacks if both exist
          await queryRunner.query(`
            INSERT INTO "feedbacks" (id, content, rating, "like", dislike, user_id, course_id, created_at, updated_at)
            SELECT id, content, rating, "like", dislike, user_id, course_id, created_at, updated_at
            FROM "comments"
            ON CONFLICT (id) DO NOTHING
          `);
        }
        // Drop comments table regardless of schema
        await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
      }
    } else if (commentsExists[0].exists) {
      // Only comments exists, rename it to feedbacks
      await queryRunner.query(`ALTER TABLE "comments" RENAME TO "feedbacks"`);
      
      // Check and rename constraints only if they exist
      const userConstraintExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'feedbacks'
          AND constraint_name = 'fk_comments_user'
        );
      `);
      
      if (userConstraintExists[0].exists) {
        await queryRunner.query(`
          ALTER TABLE "feedbacks" 
          RENAME CONSTRAINT "fk_comments_user" TO "fk_feedbacks_user"
        `);
      }
      
      const courseConstraintExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'feedbacks'
          AND constraint_name = 'fk_comments_course'
        );
      `);
      
      if (courseConstraintExists[0].exists) {
        await queryRunner.query(`
          ALTER TABLE "feedbacks" 
          RENAME CONSTRAINT "fk_comments_course" TO "fk_feedbacks_course"
        `);
      }

      // Rename indexes if they exist
      const indexesToRename = [
        { old: 'idx_comments_user', new: 'idx_feedbacks_user' },
        { old: 'idx_comments_course', new: 'idx_feedbacks_course' },
        { old: 'idx_comments_parent', new: 'idx_feedbacks_parent' }
      ];

      for (const { old: oldName, new: newName } of indexesToRename) {
        const indexExists = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = '${oldName}'
          );
        `);
        
        if (indexExists[0].exists) {
          await queryRunner.query(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
        }
      }
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
      
      // Check and rename constraints only if they exist
      const userConstraintExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'comments'
          AND constraint_name = 'fk_feedbacks_user'
        );
      `);
      
      if (userConstraintExists[0].exists) {
        await queryRunner.query(`
          ALTER TABLE "comments" 
          RENAME CONSTRAINT "fk_feedbacks_user" TO "fk_comments_user"
        `);
      }
      
      const courseConstraintExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'comments'
          AND constraint_name = 'fk_feedbacks_course'
        );
      `);
      
      if (courseConstraintExists[0].exists) {
        await queryRunner.query(`
          ALTER TABLE "comments" 
          RENAME CONSTRAINT "fk_feedbacks_course" TO "fk_comments_course"
        `);
      }

      // Rename indexes back if they exist
      const indexesToRename = [
        { old: 'idx_feedbacks_user', new: 'idx_comments_user' },
        { old: 'idx_feedbacks_course', new: 'idx_comments_course' },
        { old: 'idx_feedbacks_parent', new: 'idx_comments_parent' }
      ];

      for (const { old: oldName, new: newName } of indexesToRename) {
        const indexExists = await queryRunner.query(`
          SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = '${oldName}'
          );
        `);
        
        if (indexExists[0].exists) {
          await queryRunner.query(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
        }
      }
    }
  }
}
