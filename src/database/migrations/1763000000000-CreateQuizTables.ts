import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizTables1763000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create attempt_status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create quizzes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        creator_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN NOT NULL DEFAULT true,
        is_free BOOLEAN NOT NULL DEFAULT true,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        time_limit INT,
        total_attempts INT NOT NULL DEFAULT 0,
        share_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_quizzes_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create questions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        quiz_id UUID NOT NULL,
        question_text TEXT NOT NULL,
        order_index INT NOT NULL,
        points INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);

    // Create answer_options table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS answer_options (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_id UUID NOT NULL,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT false,
        order_index INT NOT NULL,
        CONSTRAINT fk_answer_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    // Create quiz_attempts table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        quiz_id UUID NOT NULL,
        user_id UUID NOT NULL,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        total_score INT NOT NULL DEFAULT 0,
        max_score INT NOT NULL DEFAULT 0,
        percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
        status attempt_status NOT NULL DEFAULT 'in_progress',
        CONSTRAINT fk_quiz_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create user_answers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attempt_id UUID NOT NULL,
        question_id UUID NOT NULL,
        selected_option_id UUID NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT false,
        points_earned INT NOT NULL DEFAULT 0,
        answered_at TIMESTAMP NOT NULL,
        CONSTRAINT fk_user_answers_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_answers_option FOREIGN KEY (selected_option_id) REFERENCES answer_options(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON quizzes(creator_id)`,
    );
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quizzes_public ON quizzes(is_public)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id)`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_answer_options_question ON answer_options(question_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_answers_attempt ON user_answers(attempt_id)`,
    );

    // Create trigger for quizzes updated_at
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
      CREATE TRIGGER update_quizzes_updated_at
        BEFORE UPDATE ON quizzes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_answers_attempt`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quiz_attempts_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quiz_attempts_quiz`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quiz_attempts_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_answer_options_question`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_questions_quiz`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quizzes_public`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quizzes_creator`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS user_answers`);
    await queryRunner.query(`DROP TABLE IF EXISTS quiz_attempts`);
    await queryRunner.query(`DROP TABLE IF EXISTS answer_options`);
    await queryRunner.query(`DROP TABLE IF EXISTS questions`);
    await queryRunner.query(`DROP TABLE IF EXISTS quizzes`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS attempt_status`);
  }
}
