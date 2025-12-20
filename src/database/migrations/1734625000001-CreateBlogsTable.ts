import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogsTable1734625000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "blogs" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "title" VARCHAR(255) NOT NULL,
            "content" TEXT,
            "description" TEXT,
            "image" VARCHAR(500),
            "category_id" UUID,
            "views" INTEGER NOT NULL DEFAULT 0,
            "is_active" BOOLEAN NOT NULL DEFAULT true,
            "author_id" UUID NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "deleted_at" TIMESTAMP,
            CONSTRAINT "fk_blogs_author" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE NO ACTION,
            CONSTRAINT "fk_blogs_category" FOREIGN KEY ("category_id") REFERENCES "category_blogs" ("id") ON DELETE SET NULL
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "blogs"');
  }
}
