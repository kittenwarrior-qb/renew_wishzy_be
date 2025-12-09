import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1765100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "content" TEXT NOT NULL,
        "like" INT NOT NULL DEFAULT 0,
        "dislike" INT NOT NULL DEFAULT 0,
        "user_id" UUID NOT NULL,
        "lecture_id" UUID NOT NULL,
        "parent_id" UUID,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_comments_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_comments_lecture" FOREIGN KEY ("lecture_id") REFERENCES "lectures" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_comments_parent" FOREIGN KEY ("parent_id") REFERENCES "comments" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_comments_lecture" ON "comments" ("lecture_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_comments_user" ON "comments" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments" ("parent_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "comments"');
  }
}
