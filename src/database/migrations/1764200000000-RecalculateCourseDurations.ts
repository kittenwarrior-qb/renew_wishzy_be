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

    console.log('⭐ Recalculating course ratings...');
    await queryRunner.query(`
      UPDATE courses co
      SET average_rating = COALESCE((
        SELECT ROUND(AVG(c.rating)::numeric, 2)
        FROM comments c
        WHERE c.course_id = co.id
      ), 0)
      WHERE co.deleted_at IS NULL
    `);

    console.log('💬 Recalculating comment counts...');
    await queryRunner.query(`
      UPDATE courses co
      SET rating = COALESCE((
        SELECT COUNT(*)
        FROM comments c
        WHERE c.course_id = co.id
      ), 0)
      WHERE co.deleted_at IS NULL
    `);

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
