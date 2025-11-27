import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

async function recalculateCourseData() {
  // Create database connection - support both DB_URL and individual params
  const dataSourceConfig: any = {
    type: 'postgres',
  };

  if (process.env.DB_URL) {
    // Use connection URL if available (for Neon, Supabase, etc.)
    dataSourceConfig.url = process.env.DB_URL;
    dataSourceConfig.ssl = {
      rejectUnauthorized: false, // Required for most cloud databases
    };
  } else {
    // Use individual connection parameters
    dataSourceConfig.host = process.env.DB_HOST || 'localhost';
    dataSourceConfig.port = parseInt(process.env.DB_PORT || '5432');
    dataSourceConfig.username = process.env.DB_USERNAME || 'postgres';
    dataSourceConfig.password = process.env.DB_PASSWORD || 'postgres';
    dataSourceConfig.database = process.env.DB_NAME || 'wishzy';
  }

  const dataSource = new DataSource(dataSourceConfig);

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Step 1: Update all chapter durations
    console.log('📊 Recalculating chapter durations...');
    const chapterResult = await dataSource.query(`
      UPDATE chapters c
      SET duration = COALESCE((
        SELECT SUM(l.duration)
        FROM lectures l
        WHERE l.chapter_id = c.id
          AND l.deleted_at IS NULL
      ), 0)
      WHERE c.deleted_at IS NULL
      RETURNING id, name, duration
    `);
    console.log(`✅ Updated ${chapterResult.length} chapters\n`);

    // Step 2: Update all course total_duration
    console.log('📊 Recalculating course durations...');
    const courseResult = await dataSource.query(`
      UPDATE courses co
      SET total_duration = COALESCE((
        SELECT SUM(ch.duration)
        FROM chapters ch
        WHERE ch.course_id = co.id
          AND ch.deleted_at IS NULL
      ), 0)
      WHERE co.deleted_at IS NULL
      RETURNING id, name, total_duration
    `);
    console.log(`✅ Updated ${courseResult.length} courses\n`);

    // Step 3: Update average_rating based on comments
    console.log('⭐ Recalculating course ratings...');
    const ratingResult = await dataSource.query(`
      UPDATE courses co
      SET average_rating = COALESCE((
        SELECT ROUND(AVG(c.rating)::numeric, 2)
        FROM comments c
        WHERE c.course_id = co.id
      ), 0)
      WHERE co.deleted_at IS NULL
      RETURNING id, name, average_rating
    `);
    console.log(`✅ Updated ${ratingResult.length} course ratings\n`);

    // Step 4: Update rating (total number of ratings/comments)
    console.log('💬 Recalculating comment counts...');
    const commentResult = await dataSource.query(`
      UPDATE courses co
      SET rating = COALESCE((
        SELECT COUNT(*)
        FROM comments c
        WHERE c.course_id = co.id
      ), 0)
      WHERE co.deleted_at IS NULL
      RETURNING id, name, rating
    `);
    console.log(`✅ Updated ${commentResult.length} course comment counts\n`);

    // Get detailed summary
    const summary = await dataSource.query(`
      SELECT 
        id,
        name,
        total_duration,
        average_rating,
        rating as comment_count
      FROM courses
      WHERE deleted_at IS NULL
      ORDER BY total_duration DESC
      LIMIT 10
    `);

    // Display summary
    console.log('📈 Top 10 Courses Summary:');
    console.log('═'.repeat(80));
    summary.forEach((course: any) => {
      const hours = Math.floor(course.total_duration / 3600);
      const minutes = Math.floor((course.total_duration % 3600) / 60);
      const rating = parseFloat(course.average_rating).toFixed(2);
      console.log(`📚 ${course.name}`);
      console.log(`   ⏱️  Duration: ${hours}h ${minutes}m`);
      console.log(`   ⭐ Rating: ${rating}/5 (${course.comment_count} reviews)`);
      console.log('─'.repeat(80));
    });

    console.log('\n✅ All course data recalculation completed successfully!');
    console.log('   ✓ Chapter durations');
    console.log('   ✓ Course durations');
    console.log('   ✓ Average ratings');
    console.log('   ✓ Comment counts');
  } catch (error) {
    console.error('❌ Error recalculating course data:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
recalculateCourseData();
