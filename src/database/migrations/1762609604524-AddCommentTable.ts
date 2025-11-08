import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentTable1762609604524 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "comments" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "content" TEXT NOT NULL,
            "rating" NUMERIC(2,1) NOT NULL,
            "like" INT NOT NULL,
            "dislike" INT NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "user_id" UUID NOT NULL,
            "course_id" UUID NOT NULL,
            CONSTRAINT "fk_comments_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
            CONSTRAINT "fk_comments_course" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "comments"');
  }
}
