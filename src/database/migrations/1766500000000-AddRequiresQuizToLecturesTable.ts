import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRequiresQuizToLecturesTable1766500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if requires_quiz column exists in lectures table
    const lecturesTable = await queryRunner.getTable('lectures');
    const hasRequiresQuiz = lecturesTable?.columns.find((col) => col.name === 'requires_quiz');

    if (!hasRequiresQuiz) {
      await queryRunner.addColumn(
        'lectures',
        new TableColumn({
          name: 'requires_quiz',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // Check if passing_score column exists in quizzes table
    const quizzesTable = await queryRunner.getTable('quizzes');
    const hasPassingScore = quizzesTable?.columns.find((col) => col.name === 'passing_score');

    if (!hasPassingScore) {
      await queryRunner.addColumn(
        'quizzes',
        new TableColumn({
          name: 'passing_score',
          type: 'int',
          default: 100,
          isNullable: false,
          comment: 'Minimum percentage score required to pass the quiz',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const lecturesTable = await queryRunner.getTable('lectures');
    if (lecturesTable?.columns.find((col) => col.name === 'requires_quiz')) {
      await queryRunner.dropColumn('lectures', 'requires_quiz');
    }

    const quizzesTable = await queryRunner.getTable('quizzes');
    if (quizzesTable?.columns.find((col) => col.name === 'passing_score')) {
      await queryRunner.dropColumn('quizzes', 'passing_score');
    }
  }
}
