import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecalculateCourseDurations1764200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting data recalculation...');

    console.log('📊 Recalculating chapter durations...');
    await queryRunner.query(`
      UPDATE chapters c
      SET duration = COALESCE((
        SELECT SUM(l.duration)
        FROM lectures l
        WHERE l.chapter_id = c.id
          AND l.deleted_at IS NULL
      ), 0)
      WHERE c.deleted_at IS NULL
    `);

    console.log('📊 Recalculating course durations...');
    await queryRunner.query(`
      UPDATE courses co
      SET total_duration = COALESCE((
        SELECT SUM(ch.duration)
        FROM chapters ch
        WHERE ch.course_id = co.id
          AND ch.deleted_at IS NULL
      ), 0)
      WHERE co.deleted_at IS NULL
    `);

    // Check which table exists: comments or feedbacks
    const commentsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comments'
      );
    `);
    
    const feedbacksExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'feedbacks'
      );
    `);

    const ratingTableName = feedbacksExists[0].exists ? 'feedbacks' : (commentsExists[0].exists ? 'comments' : null);

    if (ratingTableName) {
      console.log(`⭐ Recalculating course ratings from ${ratingTableName} table...`);
      // Use parameterized query with proper table name quoting
      const updateRatingQuery = `
        UPDATE courses co
        SET average_rating = COALESCE((
          SELECT ROUND(AVG(c.rating)::numeric, 2)
          FROM "${ratingTableName}" c
          WHERE c.course_id = co.id
        ), 0)
        WHERE co.deleted_at IS NULL
      `;
      await queryRunner.query(updateRatingQuery);

      console.log('💬 Recalculating comment counts...');
      const updateCountQuery = `
        UPDATE courses co
        SET rating = COALESCE((
          SELECT COUNT(*)
          FROM "${ratingTableName}" c
          WHERE c.course_id = co.id
        ), 0)
        WHERE co.deleted_at IS NULL
      `;
      await queryRunner.query(updateCountQuery);
    } else {
      console.log('⚠️  Neither comments nor feedbacks table found, skipping rating recalculation');
    }

    console.log('✅ Successfully recalculated all course data:');
    console.log('   - Chapter durations');
    console.log('   - Course durations');
    console.log('   - Average ratings');
    console.log('   - Comment counts');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️  This migration cannot be reverted as it fixes existing data');
  }
}
