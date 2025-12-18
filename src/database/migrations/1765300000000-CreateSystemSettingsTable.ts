import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSettingsTable1765300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create system_settings table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" VARCHAR(100) UNIQUE NOT NULL,
        "value" VARCHAR(500) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on key
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_system_settings_key" ON "system_settings"("key")
    `);

    // Insert default settings
    await queryRunner.query(`
      INSERT INTO "system_settings" ("key", "value", "description")
      VALUES (
        'instructor_revenue_percentage',
        '70',
        'Tỉ lệ phần trăm doanh thu instructor nhận được (0-100). Ví dụ: 70 nghĩa là instructor nhận 70%, hệ thống giữ 30%'
      )
      ON CONFLICT ("key") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_system_settings_key"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "system_settings"`);
  }
}
