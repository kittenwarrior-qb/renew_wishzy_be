import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLectureNotesTable1765200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lecture_notes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "content" TEXT NOT NULL,
        "timestamp_seconds" INT NOT NULL DEFAULT 0,
        "user_id" UUID NOT NULL,
        "lecture_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_lecture_notes_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_lecture_notes_lecture" FOREIGN KEY ("lecture_id") REFERENCES "lectures" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_lecture_notes_lecture" ON "lecture_notes" ("lecture_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_lecture_notes_user" ON "lecture_notes" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_lecture_notes_user_lecture" ON "lecture_notes" ("user_id", "lecture_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "lecture_notes"');
  }
}
