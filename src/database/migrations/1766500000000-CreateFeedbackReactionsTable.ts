import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeedbackReactionsTable1766500000000 implements MigrationInterface {
  name = 'CreateFeedbackReactionsTable1766500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for reaction
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE reaction_type AS ENUM ('like', 'dislike');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create feedback_reactions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feedback_reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "feedback_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "type" reaction_type NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feedback_reactions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_feedback_reactions_feedback_user" UNIQUE ("feedback_id", "user_id"),
        CONSTRAINT "FK_feedback_reactions_feedback" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_feedback_reactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_feedback_reactions_feedback_id" ON "feedback_reactions" ("feedback_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_feedback_reactions_user_id" ON "feedback_reactions" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feedback_reactions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feedback_reactions_feedback_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feedback_reactions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS reaction_type`);
  }
}
