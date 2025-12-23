const { Client } = require('pg');
require('dotenv').config();

async function updateQuizFlags() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'wishzy_2025',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update lectures to set requiresQuiz = true if they have quizzes
    const result1 = await client.query(`
      UPDATE lectures 
      SET requires_quiz = true 
      WHERE id IN (
        SELECT DISTINCT entity_id 
        FROM quizzes 
        WHERE entity_id IS NOT NULL
      )
    `);
    console.log(`✅ Updated ${result1.rowCount} lectures to requiresQuiz = true`);

    // Update lectures to set requiresQuiz = false if they have no quizzes
    const result2 = await client.query(`
      UPDATE lectures 
      SET requires_quiz = false 
      WHERE id NOT IN (
        SELECT DISTINCT entity_id 
        FROM quizzes 
        WHERE entity_id IS NOT NULL
      )
    `);
    console.log(`✅ Updated ${result2.rowCount} lectures to requiresQuiz = false`);

    // Verify results
    const verification = await client.query(`
      SELECT 
        l.id, 
        l.name, 
        l.requires_quiz, 
        COUNT(q.id) as quiz_count
      FROM lectures l
      LEFT JOIN quizzes q ON l.id = q.entity_id
      WHERE l.requires_quiz = true
      GROUP BY l.id, l.name, l.requires_quiz
      ORDER BY l.name
    `);

    console.log('\n📋 Lectures with quizzes:');
    if (verification.rows.length === 0) {
      console.log('   No lectures with quizzes found');
    } else {
      verification.rows.forEach(row => {
        console.log(`   - ${row.name} (requiresQuiz: ${row.requires_quiz}, quizzes: ${row.quiz_count})`);
      });
    }

    console.log('\n🎉 Update completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Make sure your database is running and .env file is configured correctly');
  } finally {
    await client.end();
  }
}

updateQuizFlags();