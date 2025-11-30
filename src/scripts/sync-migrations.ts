import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function syncMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await dataSource.initialize();
    console.log('🔄 Syncing migrations...');

    // Create migrations table if not exists
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);
    console.log('✅ Migrations table ready');

    const migrations = [
      { timestamp: 1761991521090, name: 'CreateUserTable1761991521090' },
      { timestamp: 1762002355221, name: 'CreateCategoryTable1762002355221' },
      { timestamp: 1762010085844, name: 'CreateCourseTable1762010085844' },
      { timestamp: 1762011458468, name: 'AddStatusColumnToCourseTable1762011458468' },
      { timestamp: 1762015613074, name: 'CreateDocumentTable1762015613074' },
      { timestamp: 1762054277839, name: 'CreateChapterTable1762054277839' },
      { timestamp: 1762057592241, name: 'CreateLectureTable1762057592241' },
      { timestamp: 1762062191454, name: 'CreateVoucherTable1762062191454' },
      { timestamp: 1762062709161, name: 'CreateOrderTable1762062709161' },
      { timestamp: 1762140582832, name: 'CreateDetailOrderTable1762140582832' },
      { timestamp: 1762176397159, name: 'CreateEnrollmentTable1762176397159' },
      { timestamp: 1762607807695, name: 'CreateBannerTable1762607807695' },
      { timestamp: 1762609604524, name: 'AddCommentTable1762609604524' },
      { timestamp: 1762869782577, name: 'CreateWishlist1762869782577' },
      { timestamp: 1763000000000, name: 'CreateQuizTables1763000000000' },
      { timestamp: 1763186171572, name: 'AddAttributeColumnToEnrollmentTable1763186171572' },
      { timestamp: 1763192873030, name: 'AddVideoSourceColumnToLectureTable1763192873030' },
      { timestamp: 1764147000000, name: 'AddCertificateImageUrlToEnrollments1764147000000' },
      { timestamp: 1764200000000, name: 'RecalculateCourseDurations1764200000000' },
    ];

    for (const migration of migrations) {
      await dataSource.query(
        `INSERT INTO migrations (timestamp, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [migration.timestamp, migration.name],
      );
      console.log(`✅ Synced: ${migration.name}`);
    }

    console.log('🎉 All migrations synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing migrations:', error);
  } finally {
    await dataSource.destroy();
  }
}

syncMigrations();
