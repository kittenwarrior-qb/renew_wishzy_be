import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentBlogsTable1734625000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "comment_blogs" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "content" TEXT NOT NULL,
            "user_id" UUID NOT NULL,
            "blog_id" UUID NOT NULL,
            "parent_id" UUID,
            "likes" INTEGER NOT NULL DEFAULT 0,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "fk_comment_blogs_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION,
            CONSTRAINT "fk_comment_blogs_blog" FOREIGN KEY ("blog_id") REFERENCES "blogs" ("id") ON DELETE CASCADE,
            CONSTRAINT "fk_comment_blogs_parent" FOREIGN KEY ("parent_id") REFERENCES "comment_blogs" ("id") ON DELETE CASCADE
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "comment_blogs"');
  }
}
