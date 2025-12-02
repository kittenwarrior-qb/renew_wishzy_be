import { DataSource } from 'typeorm';
import dataSource from '../database/data-source';
import * as fs from 'fs';
import * as path from 'path';

async function syncMigrations() {
  let connection: DataSource | null = null;

  try {
    connection = await dataSource.initialize();

    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    const existingMigrations = await connection.query(
      'SELECT * FROM migrations ORDER BY timestamp',
    );

    for (const file of migrationFiles) {
      const match = file.match(/^(\d+)-(.+)\.(ts|js)$/);
      if (!match) {
        continue;
      }

      const timestamp = parseInt(match[1]);
      const name = match[2];

      const exists = existingMigrations.some(
        (m: any) => m.timestamp === timestamp.toString() || m.name === name,
      );

      if (!exists) {
        await connection.query('INSERT INTO migrations (timestamp, name) VALUES ($1, $2)', [
          timestamp,
          name,
        ]);
      } else {
        console.log(`- Migration already exists: ${name}`);
      }
    }
  } catch (error) {
    console.error('Error syncing migrations:', error);
    process.exit(1);
  } finally {
    if (connection?.isInitialized) {
      await connection.destroy();
    }
  }
}

syncMigrations();
